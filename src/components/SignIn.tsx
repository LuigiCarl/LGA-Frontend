import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Wallet, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SignIn() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});

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
        await login(email, password);
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
    setShowPassword(false);
    setShowPasswordConfirmation(false);
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
        <div className="mb-6">
          <h2 className="text-base leading-4 text-[#0A0A0A] dark:text-white mb-2">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-base leading-6 text-[#717182] dark:text-[#A1A1AA]">
            {isSignUp
              ? 'Fill in your details to create a new account'
              : 'Enter your credentials to access your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="John Doe"
                className={`w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                  errors.name
                    ? 'border-[#EF4444] dark:border-[#EF4444]'
                    : 'border-transparent dark:border-white/10'
                } rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Email <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="you@example.com"
              className={`w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                errors.email
                  ? 'border-[#EF4444] dark:border-[#EF4444]'
                  : 'border-transparent dark:border-white/10'
              } rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
              Password <span className="text-[#EF4444]">*</span>
              {isSignUp && (
                <span className="text-[#717182] dark:text-[#A1A1AA] ml-1">(min: 8 characters)</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder="••••••••"
                className={`w-full h-9 px-3 pr-10 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                  errors.password
                    ? 'border-[#EF4444] dark:border-[#EF4444]'
                    : 'border-transparent dark:border-white/10'
                } rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#717182] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.password}
              </p>
            )}

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
              <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                Confirm Password <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    if (errors.passwordConfirmation)
                      setErrors({ ...errors, passwordConfirmation: undefined });
                  }}
                  placeholder="••••••••"
                  className={`w-full h-9 px-3 pr-10 bg-[#F3F3F5] dark:bg-[#27272A] border ${
                    errors.passwordConfirmation
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
                  aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                >
                  {showPasswordConfirmation ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.passwordConfirmation && (
                <p className="mt-1 text-xs text-[#EF4444] flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.passwordConfirmation}
                </p>
              )}
              {passwordConfirmation &&
                password === passwordConfirmation &&
                !errors.passwordConfirmation && (
                  <p className="mt-1 text-xs text-[#10B981] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials (Sign In Only) */}
        {!isSignUp && (
          <div className="mt-4 p-4 bg-[#ECECF0]/50 dark:bg-[#27272A]/50 border border-black/10 dark:border-white/10 rounded-[10px]">
            <p className="text-sm leading-5 text-[#717182] dark:text-[#A1A1AA] mb-1">
              Demo credentials:
            </p>
            <p className="text-sm leading-5 text-[#0A0A0A] dark:text-white mb-1">
              Email: demo@example.com
            </p>
            <p className="text-sm leading-5 text-[#0A0A0A] dark:text-white">Password: demo123</p>
          </div>
        )}
      </div>

      {/* Toggle Mode Link */}
      <div className="mt-6 text-center">
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
