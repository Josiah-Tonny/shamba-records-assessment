import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
      const userRes = await login(formData.email, formData.password);
      navigate(userRes.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Agriculture" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Sprout size={28} />
            </div>
            <h1 className="text-2xl font-bold">Shamba Records</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">Empowering Modern Agriculture</h2>
          <p className="text-green-100 text-lg max-w-md">
            Efficiently manage crop seasons, track field agents, and optimize harvest results.
          </p>
          <div className="mt-auto pt-8 text-green-200 text-sm">
            &copy; 2026 Shamba Records
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Sprout size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Shamba Records</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-6">
              Sign in to manage your fields or{' '}
              <Link to="/register" className="text-green-600 font-semibold hover:underline">create a new account</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                required
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={18} />
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

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck size={16} />
                Demo Credentials
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin:</span>
                  <span className="font-mono text-gray-800">admin@smartseason.com / Admin@1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent:</span>
                  <span className="font-mono text-gray-800">agent@smartseason.com / Agent@1234</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <Info size={12} />
                For testing purposes only
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
