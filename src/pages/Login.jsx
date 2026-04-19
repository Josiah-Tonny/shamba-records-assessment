import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--primary-600)' }}>
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Shamba Records
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Smart Season Management System
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border shadow-lg"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border-light)',
          }}>

          {/* Card Header */}
          <div className="px-8 pt-8 pb-2 text-center">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Welcome Back
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Sign in to manage your agricultural fields
            </p>
          </div>

          {/* Card Body */}
          <div className="px-8 pt-6 pb-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--error-50)',
                    border: '1px solid var(--error-200)',
                    color: 'var(--error-700)',
                  }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium transition-colors"
                  style={{ color: 'var(--primary-600)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--primary-700)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--primary-600)'}
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
              <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
                Demo Credentials
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                  style={{ backgroundColor: 'var(--earth-100)' }}>
                  <span className="font-semibold" style={{ color: 'var(--earth-700)' }}>Admin</span>
                  <span style={{ color: 'var(--text-secondary)' }}>admin@smartseason.com / Admin@1234</span>
                </div>
                <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                  style={{ backgroundColor: 'var(--earth-100)' }}>
                  <span className="font-semibold" style={{ color: 'var(--earth-700)' }}>Agent</span>
                  <span style={{ color: 'var(--text-secondary)' }}>agent@smartseason.com / Agent@1234</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          &copy; 2024 Shamba Records. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;