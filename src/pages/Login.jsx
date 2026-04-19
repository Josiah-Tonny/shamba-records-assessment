import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/agent/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            <h2>Welcome Back</h2>
            <p>Sign in to manage your agricultural fields</p>
          </div>

          {/* Card Body */}
          <div className="login-card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <div className="login-error animate-shake">
                  <AlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <div className="login-footer">
              <p>
                Don&apos;t have an account?{' '}
                <Link to="/register">
                  Create one
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="login-demo">
              <p className="login-demo-title">Demo Credentials</p>
              <div className="space-y-2">
                <div className="login-demo-item">
                  <span className="login-demo-role">Admin</span>
                  <span className="login-demo-creds">admin@smartseason.com / Admin@1234</span>
                </div>
                <div className="login-demo-item">
                  <span className="login-demo-role">Agent</span>
                  <span className="login-demo-creds">agent@smartseason.com / Agent@1234</span>
                </div>
              </div>
            </div>
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

export default Login;