import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { forgotPassword } = useAuth()
  const [, navigate] = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await forgotPassword(email)
    
    if (result.success) {
      toast.success(result.message)
      setIsSubmitted(true)
    } else {
      toast.error(result.message)
    }
    
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-muted-foreground mb-6">
            We've sent a password reset link to {email}. Please check your inbox.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Back to login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/login')}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">Back to login</span>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground mt-2">Enter your email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
