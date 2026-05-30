import { useState } from 'react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { api } from '@/services/api'
import { toast } from 'sonner'

interface VerificationNeededPageProps {
  email?: string
  [key: string]: unknown
}

export function VerificationNeededPage({ email: initialEmail }: VerificationNeededPageProps) {
  const [email, setEmail] = useState(initialEmail || '')
  const [isResending, setIsResending] = useState(false)
  const [hasResent, setHasResent] = useState(false)

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsResending(true)
    try {
      const response = await api.auth.resendVerification(email)
      if (response.success) {
        toast.success('Verification email sent! Check your inbox.')
        setHasResent(true)
      } else {
        toast.error(response.message || 'Failed to resend verification email')
      }
    } catch {
      toast.error('Failed to resend verification email')
    }
    setIsResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Account Created Successfully!</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            We have sent a verification email to your email address.
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Please check your inbox</p>
              <p className="text-muted-foreground mt-1">
                Click the verification link in the email before logging in.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> If you cannot find the email, please check your Spam or Junk folder.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={hasResent}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending || hasResent}
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : hasResent ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Email Sent!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}