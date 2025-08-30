import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';

interface SignInProps {
  onSwitchToSignUp: () => void;
}

export const SignIn = ({ onSwitchToSignUp }: SignInProps) => {
  const { signIn, verifySignInOTP } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [showOtp, setShowOtp] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOTP, setReceivedOTP] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      return;
    }

    setIsLoading(true);
    
          try {
        const otp = await signIn(formData.email);
        // Store the OTP received from the API response
        setReceivedOTP(otp);
        setOtpSent(true);
      } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await verifySignInOTP(formData.email, formData.otp, keepLoggedIn);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    
    try {
      const otp = await signIn(formData.email);
      // Update with the new OTP received from the API response
      setReceivedOTP(otp);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
          <p className="text-gray-600">Please login to continue to your account.</p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`h-12 px-3 border-2 rounded-lg bg-white focus:ring-0 focus:border-white transition-all duration-200 ${
                    focusedField === 'email' ? 'border-blue-500' : 'border-gray-300'
                  }`}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    focusedField === 'email' || formData.email
                      ? 'text-blue-500 text-xs -top-2 bg-white px-1'
                      : 'text-gray-500 text-base top-3'
                  }`}
                >
                  Email
                </label>
              </div>
            </div>

            {/* Send OTP Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
              disabled={isLoading || !formData.email.trim()}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <GoogleLoginButton 
              onSuccess={() => {
                // Google login successful, user will be automatically logged in
              }}
              onError={(error) => {
                console.error('Google login error:', error);
              }}
            />
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            {/* Email Display */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">OTP sent to:</p>
              <p className="font-medium text-gray-900">{formData.email}</p>
            </div>

            {/* OTP Display */}
            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">🔑 Your OTP:</p>
              <p className="text-2xl font-bold text-blue-800 font-mono">{receivedOTP}</p>
              <p className="text-xs text-blue-500 mt-1">Copy this OTP to verify your signin</p>
            </div>

            {/* OTP Field */}
            <div className="relative">
              <div className="relative">
                <Input
                  id="otp"
                  type={showOtp ? 'text' : 'password'}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                  className={`h-12 px-3 pr-10 border-2 rounded-lg bg-white focus:ring-0 focus:border-white transition-all duration-200 ${
                    focusedField === 'otp' ? 'border-blue-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                <label
                  htmlFor="otp"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    focusedField === 'otp' || formData.otp
                      ? 'text-blue-500 text-xs -top-2 bg-white px-1'
                      : 'text-gray-500 text-base top-3'
                  }`}
                >
                  OTP
                </label>
              </div>
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-sm text-blue-500 hover:text-blue-600 underline mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            {/* Keep me logged in checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onCheckedChange={(checked) => setKeepLoggedIn(checked as boolean)}
                className="border-gray-300"
              />
              <label htmlFor="keepLoggedIn" className="text-sm text-gray-900">
                Keep me logged in
              </label>
            </div>

            {/* Sign in button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
              disabled={isLoading || !formData.otp.trim()}
            >
              {isLoading ? 'Verifying...' : 'Sign in'}
            </Button>
          </form>
        )}

        {/* Create account link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Need an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Create one
          </button>
        </div>

        {/* Back to email button */}
        {otpSent && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setFormData({ ...formData, otp: '' });
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
