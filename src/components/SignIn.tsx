import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Check, X, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FloatingInput } from './ui/floating-input';
import { LoadingButton } from './ui/loading-button';

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
      <div className="w-full max-w-[448px] mb-6">
        <div className="flex justify-center mb-3">
          <img 
            src="/icon.png" 
            alt="FinanEase Logo" 
            className="w-24 h-24 object-contain"
          />
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
