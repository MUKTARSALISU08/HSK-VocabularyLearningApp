import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Lock, Edit3, Upload, Zap, Flame, BookOpen, Award, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useProgress } from '@/contexts/progress-context'
import { toast } from 'sonner'
import { api } from '@/services/api'

export function ProfilePage() {
  const { user, changePassword, updateUser } = useAuth()
  const { progress } = useProgress()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveProfile = () => {
    if (username !== user?.username) {
      updateUser({ username })
      toast.success('Profile updated successfully')
    }
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setIsChangingPassword(true)
    const result = await changePassword(currentPassword, newPassword, confirmPassword)
    
    if (result.success) {
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast.error(result.message)
    }
    
    setIsChangingPassword(false)
  }

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and WEBP are supported')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string
          console.log('Attempting to upload avatar...')
          const response = await api.auth.uploadAvatar({ avatarBase64: base64String })
          console.log('Upload response:', response)
          
          if (response.success) {
            setAvatarUrl(response.avatarUrl)
            updateUser({ avatarUrl: response.avatarUrl })
            toast.success('Avatar uploaded successfully')
          } else {
            toast.error(response.message || 'Failed to upload avatar')
          }
        } catch (apiError) {
          console.error('API upload error:', apiError)
          toast.error('Failed to upload avatar: ' + (apiError as Error).message)
        } finally {
          setIsUploadingAvatar(false)
        }
      }
      
      reader.onerror = (error) => {
        console.error('File reader error:', error)
        toast.error('Failed to read image file')
        setIsUploadingAvatar(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Avatar change error:', error)
      toast.error('Failed to upload avatar')
      setIsUploadingAvatar(false)
    }
  }

  const wordsLearned = Object.values(progress.lessonProgress).reduce(
    (acc, curr) => acc + curr.wordsLearned,
    0
  )

  const completedLessons = progress.completedLessons.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and view your progress</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              {isEditing && (
                <button 
                  className="absolute bottom-0 right-0 p-1 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                >
                  <Upload className="h-4 w-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 space-y-3">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold">{user?.username}</h2>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
              )}
              
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Save</Button>
                  <Button variant="outline" onClick={() => {
                    setUsername(user?.username || '')
                    setAvatarUrl(user?.avatarUrl || '')
                    setIsEditing(false)
                  }}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Learning Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-2xl font-bold">{user?.xp || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
              <Flame className="h-5 w-5" />
              <span className="text-2xl font-bold">{user?.streak || 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Daily Streak</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-2xl font-bold">{wordsLearned}</span>
            </div>
            <p className="text-sm text-muted-foreground">Words Learned</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-blue-500 mb-2">
              <Award className="h-5 w-5" />
              <span className="text-2xl font-bold">{completedLessons}</span>
            </div>
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <Button onClick={handleChangePassword} disabled={isChangingPassword}>
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
