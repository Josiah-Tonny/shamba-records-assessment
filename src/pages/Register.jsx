import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sprout, User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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


  return (
    <div className="login-container">
      <div className="login-box animate-slide-up stagger-1">

        {/* Logo Section */}
        <div className="login-logo animate-fade-in stagger-2">
          <div className="login-logo-icon shadow-md">
            <Sprout />
          </div>
          <h1>Shamba Records</h1>
          <p>Smart Season Management System</p>
        </div>

        {/* Card */}
        <div className="login-card">

          {/* Card Header */}
          <div className="login-card-header">
            <h2>Create Account</h2>
            <p>
              Already have an account?{' '}
              <Link to="/login">
                Sign in
              </Link>
            </p>
          </div>

          {/* Card Body */}
          <div className="login-card-body">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Full Name */}
              <Input
                label="Full Name"
                name="name"
                type="text"
                icon={User}
                required
                placeholder="Jane Wanjiku"
                value={formData.name}
                onChange={handleChange}
              />

              {/* Email */}
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                required
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
              />

              {/* Password */}
              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                required
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={ShieldCheck}
                required
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={passwordError}
              />

              {/* Role */}
              <div>
                <label className="block mb-2 text-sm font-medium text-primary">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all duration-fast
                        ${formData.role === role.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-default bg-secondary hover:border-primary-300'
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
                          ? 'text-primary-700'
                          : 'text-primary'
                      }`}>
                        {role.label}
                      </span>
                      <span className="text-xs leading-snug text-muted">
                        {role.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Error */}
              {error && (
                <div className="login-error">
                  <AlertCircle />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="login-page-footer">
          &copy; 2024 Shamba Records. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
