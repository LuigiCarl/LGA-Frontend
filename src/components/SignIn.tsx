import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router';
import { Eye, EyeOff, Check, X, User, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTerms } from '../context/TermsContext';
import { FloatingInput } from './ui/floating-input';
import { LoadingButton } from './ui/loading-button';
import { BeamsBackground } from './ui/beams-background';

export function SignIn() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading } = useAuth();
  const { showTermsModal } = useTerms();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    terms?: string;
  }>({});

  // Redirect to dashboard if already authenticated (AFTER all hooks are defined)
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validation
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (isSignUp) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (isSignUp) {
      if (!passwordConfirmation) {
        newErrors.passwordConfirmation = 'Please confirm your password';
      } else if (password !== passwordConfirmation) {
        newErrors.passwordConfirmation = 'Passwords do not match';
      }

      if (!acceptTerms) {
        newErrors.terms = 'Please accept the Terms and Conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '' };

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

  const passwordStrength = isSignUp ? getPasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        await register(name, email, password, passwordConfirmation);
      } else {
        await login(email, password, rememberMe);
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Authentication error:', error);
      setErrors({
        email: error.message || 'Authentication failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setRememberMe(false);
    setAcceptTerms(false);
    setShowPassword(false);
    setShowPasswordConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex flex-col items-center py-4 px-4 relative overflow-hidden">
      {/* Animated Beams Background */}
      <BeamsBackground />
      
      {/* Header */}
      <div className="relative z-10 w-full max-w-[448px] mb-4">
        <div className="flex justify-center mb-2">
          <img 
            src="/icon.png" 
            alt="FinanEase Logo" 
            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
          />
        </div>
        <div className="text-center">
          <h1 className="text-[24px] md:text-[28px] leading-7 md:leading-8 text-gray-800 dark:text-white mb-1 font-bold drop-shadow-lg">
            FinanEase
          </h1>
          <p className="text-sm md:text-base leading-5 md:leading-6 text-gray-600 dark:text-gray-200 drop-shadow-md">
            Manage your finances with ease
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative z-10 w-full max-w-[448px] bg-white/80 dark:bg-black/20 backdrop-blur-xl border border-white/60 dark:border-white/20 rounded-[14px] p-4 md:p-6 shadow-2xl">
        <div className="mb-4">
          <h2 className="text-base leading-4 text-gray-800 dark:text-white mb-1">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-sm leading-5 text-gray-600 dark:text-gray-300">
            {isSignUp
              ? 'Fill in your details to create a new account'
              : 'Enter your credentials to access your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <FloatingInput
              type="text"
              label="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
              required
              icon={<User className="w-4 h-4" />}
            />
          )}

          {/* Email Field */}
          <FloatingInput
            type="email"
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          {/* Password Field */}
          <div>
            <FloatingInput
              type={showPassword ? 'text' : 'password'}
              label={isSignUp ? 'Password (min: 8 characters)' : 'Password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              error={errors.password}
              required
              icon={<Lock className="w-4 h-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Security Reminder (Sign Up Only - Shows when password field is focused) */}
            <AnimatePresence>
              {isSignUp && isPasswordFocused && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400">
                        ⚠️
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Security Tip:</strong> Don't use your real email password here. Create a unique password for this budget tracker.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Strength Indicator (Sign Up Only) */}
            {isSignUp && password && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
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
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs">
                    {password.length >= 8 ? (
                      <Check className="w-3 h-3 text-[#10B981]" />
                    ) : (
                      <X className="w-3 h-3 text-[#717182] dark:text-[#71717A]" />
                    )}
                    <span
                      className={
                        password.length >= 8
                          ? 'text-[#10B981]'
                          : 'text-[#717182] dark:text-[#71717A]'
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Forgot Password Link (Sign In Only) */}
          {!isSignUp && (
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#6366F1] hover:text-[#8B5CF6] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <div>
              <FloatingInput
                label="Confirm Password"
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                  if (errors.passwordConfirmation)
                    setErrors({ ...errors, passwordConfirmation: undefined });
                }}
                icon={<Lock className="w-4 h-4" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                    aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                error={errors.passwordConfirmation}
                required
                success={passwordConfirmation && password === passwordConfirmation && !errors.passwordConfirmation ? 'Passwords match' : undefined}
              />
            </div>
          )}

          {/* Terms and Conditions (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors({ ...errors, terms: undefined });
                      }
                    }}
                    className="w-4 h-4 text-[#6366F1] bg-white dark:bg-[#27272A] border-[#ECECF0] dark:border-[#27272A] rounded focus:ring-[#6366F1] dark:focus:ring-[#8B5CF6] focus:ring-2"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="acceptTerms" className="text-[#0A0A0A] dark:text-white">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => showTermsModal(
                        () => setAcceptTerms(true), // Auto-check checkbox when terms are accepted
                        () => setAcceptTerms(false) // Uncheck if declined
                      )}
                      className="text-[#6366F1] hover:text-[#8B5CF6] hover:underline transition-colors"
                    >
                      Terms and Conditions
                    </button>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-[#D4183D] dark:text-[#F87171] mt-1">{errors.terms}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Remember Me (Sign In Only) */}
          {!isSignUp && (
            <div className="flex items-center gap-3">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#6366F1] bg-white dark:bg-[#27272A] border-[#ECECF0] dark:border-[#27272A] rounded focus:ring-[#6366F1] dark:focus:ring-[#8B5CF6] focus:ring-2"
                />
              </div>
              <label htmlFor="rememberMe" className="text-sm text-[#0A0A0A] dark:text-white">
                Remember me
              </label>
            </div>
          )}

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText={isSignUp ? 'Creating account...' : 'Signing in...'}
            className="w-full"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </LoadingButton>
        </form>
      </div>

      {/* Toggle Mode Link */}
      <div className="mt-4 text-center">
        <span className="text-sm text-[#717182] dark:text-[#A1A1AA]">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        </span>
        <button
          onClick={toggleMode}
          className="text-base text-[#030213] dark:text-[#A78BFA] hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
