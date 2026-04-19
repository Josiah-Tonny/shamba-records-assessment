import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, ShieldCheck, Eye, EyeOff, ChevronDown, AlertCircle } from 'lucide-react';

const ROLES = [
  { value: 'agent', label: 'Field Agent',    description: 'Monitor and update assigned fields' },
  { value: 'admin', label: 'Administrator',  description: 'Manage all fields, agents and reports' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
  });
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError]       = useState('');
  const [loading, setLoading]                   = useState(false);

  const { register, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;
    navigate(
      user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard',
      { replace: true }
    );
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `
    w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)]
    bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm
    placeholder:text-[var(--text-muted)]
    focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-[var(--primary-500)]
    transition-colors
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4 py-12">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--primary-100)] opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--primary-100)] opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--primary-600)] shadow-lg mb-4">
            <span className="text-2xl">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[var(--primary-600)] hover:text-[var(--primary-700)] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Wanjiku"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputBase} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputBase} pr-10 ${passwordError ? 'border-[var(--error-400)] focus:ring-[var(--error-400)]' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-[var(--error-600)] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${formData.role === role.value
                        ? 'border-[var(--primary-500)] bg-[var(--primary-50)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--primary-300)]'
                      }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${
                      formData.role === role.value
                        ? 'text-[var(--primary-700)]'
                        : 'text-[var(--text-primary)]'
                    }`}>
                      {role.label}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] leading-snug">
                      {role.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* API Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--error-50)] border border-[var(--error-200)]">
                <AlertCircle className="w-4 h-4 text-[var(--error-600)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--error-700)]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white
                         bg-[var(--primary-600)] hover:bg-[var(--primary-700)]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors shadow-sm mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-6">
          SmartSeason Field Monitoring System
        </p>
      </div>
    </div>
  );
};

export default Register;
