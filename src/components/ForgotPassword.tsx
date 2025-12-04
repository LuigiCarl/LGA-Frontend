import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { Wallet, ArrowLeft, Check, X, Eye, EyeOff, Loader2, Mail, KeyRound } from 'lucide-react';
import { authAPI } from '../lib/api';

type ViewMode = 'request' | 'reset' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if we have a token in the URL (coming from email link)
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');
  
  // Determine initial view based on URL params
  const [view, setView] = useState<ViewMode>(tokenFromUrl && emailFromUrl ? 'reset' : 'request');
  
  // Request form state
  const [email, setEmail] = useState(emailFromUrl || '');
  const [requestError, setRequestError] = useState('');
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Reset form state
  const [token] = useState(tokenFromUrl || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetErrors, setResetErrors] = useState<{
    password?: string;
    passwordConfirmation?: string;
  }>({});

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#10B981'];

    return {
      strength: Math.min(strength, 4),
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)],
    };
  };

  const passwordStrength = getPasswordStrength(password);

  // Password requirements check
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  // Validate email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle forgot password request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');

    if (!email.trim()) {
      setRequestError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setRequestError('Please enter a valid email address');
      return;
    }

    setIsRequestLoading(true);

    try {
      await authAPI.forgotPassword({ email: email.trim() });
      setRequestSuccess(true);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset link. Please try again.';
      setRequestError(message);
    } finally {
      setIsRequestLoading(false);
    }
  };

  // Validate reset form
  const validateResetForm = (): boolean => {
    const errors: typeof resetErrors = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!passwordRequirements.every(req => req.met)) {
      errors.password = 'Password does not meet all requirements';
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
    } else if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }

    setResetErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password reset
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!validateResetForm()) return;

    setIsResetLoading(true);

    try {
      await authAPI.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setView('success');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.';
      setResetError(message);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center pt-8 px-4">
      {/* Header */}
      <div className="w-full max-w-[448px] mb-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-[30px] leading-9 text-[#0A0A0A] dark:text-white mb-2">
            FinanEase
          </h1>
          <p className="text-base leading-6 text-[#717182] dark:text-[#A1A1AA]">
            Manage your finances with ease
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-[448px] bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] p-6 shadow-xl dark:shadow-[#6366F1]/10">
        
        {/* Request Reset Link View */}
        {view === 'request' && !requestSuccess && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#6366F1]" />
                </div>
                <div>
                  <h2 className="text-base leading-4 text-[#0A0A0A] dark:text-white">
                    Forgot Password?
                  </h2>
                  <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mt-1">
                    No worries, we'll send you reset instructions
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Email Address <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setRequestError('');
                  }}
                  placeholder="you@example.com"
                  className={`w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                    requestError
                      ? 'border-[#EF4444] dark:border-[#EF4444]'
                      : 'border-transparent dark:border-white/10'
                  } rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50`}
                  autoFocus
                />
                {requestError && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {requestError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isRequestLoading}
                className={`w-full h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 transition-all ${
                  isRequestLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {isRequestLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </>
        )}

        {/* Email Sent Success View */}
        {view === 'request' && requestSuccess && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-lg text-[#0A0A0A] dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-4">
                We've sent a password reset link to:
              </p>
              <p className="text-sm text-[#0A0A0A] dark:text-white font-medium mb-6">
                {email}
              </p>
              <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setRequestSuccess(false)}
                  className="text-[#6366F1] hover:underline"
                >
                  try again
                </button>
              </p>
            </div>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </>
        )}

        {/* Reset Password View */}
        {view === 'reset' && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#6366F1]/10 dark:bg-[#6366F1]/20 rounded-full flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#6366F1]" />
                </div>
                <div>
                  <h2 className="text-base leading-4 text-[#0A0A0A] dark:text-white">
                    Reset Your Password
                  </h2>
                  <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mt-1">
                    Choose a strong, unique password
                  </p>
                </div>
              </div>
            </div>

            {resetError && (
              <div className="mb-4 p-3 bg-[#EF4444]/10 dark:bg-[#EF4444]/20 border border-[#EF4444]/20 rounded-lg">
                <p className="text-sm text-[#EF4444] flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {resetError}
                </p>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  New Password <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (resetErrors.password) setResetErrors({ ...resetErrors, password: undefined });
                    }}
                    placeholder="••••••••"
                    className={`w-full h-9 px-3 pr-10 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                      resetErrors.password
                        ? 'border-[#EF4444] dark:border-[#EF4444]'
                        : 'border-transparent dark:border-white/10'
                    } rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetErrors.password && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {resetErrors.password}
                  </p>
                )}

                {/* Password Strength */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1 bg-[#ECECF0] dark:bg-[#27272A] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(passwordStrength.strength / 4) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                          {req.met ? (
                            <Check className="w-3 h-3 text-[#10B981]" />
                          ) : (
                            <X className="w-3 h-3 text-[#717182] dark:text-[#71717A]" />
                          )}
                          <span className={req.met ? 'text-[#10B981]' : 'text-[#717182] dark:text-[#71717A]'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Confirm Password <span className="text-[#EF4444]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => {
                      setPasswordConfirmation(e.target.value);
                      if (resetErrors.passwordConfirmation) setResetErrors({ ...resetErrors, passwordConfirmation: undefined });
                    }}
                    placeholder="••••••••"
                    className={`w-full h-9 px-3 pr-10 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                      resetErrors.passwordConfirmation
                        ? 'border-[#EF4444] dark:border-[#EF4444]'
                        : passwordConfirmation && password === passwordConfirmation
                        ? 'border-[#10B981] dark:border-[#10B981]'
                        : 'border-transparent dark:border-white/10'
                    } rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                  >
                    {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetErrors.passwordConfirmation && (
                  <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {resetErrors.passwordConfirmation}
                  </p>
                )}
                {passwordConfirmation && password === passwordConfirmation && !resetErrors.passwordConfirmation && (
                  <p className="mt-1 text-xs text-[#10B981] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isResetLoading}
                className={`w-full h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 transition-all ${
                  isResetLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {isResetLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </>
        )}

        {/* Success View */}
        {view === 'success' && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#10B981]" />
              </div>
              <h2 className="text-lg text-[#0A0A0A] dark:text-white mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-6">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-all"
              >
                Sign In Now
              </button>
            </div>
          </>
        )}
      </div>

      {/* Security Notice */}
      <div className="w-full max-w-[448px] mt-4 text-center">
        <p className="text-xs text-[#717182] dark:text-[#A1A1AA]">
          🔒 For security, password reset links expire after 60 minutes
        </p>
      </div>
    </div>
  );
}
