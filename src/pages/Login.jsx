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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Agriculture" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Shamba Records</h1>
              <p className="text-emerald-200 text-sm font-medium">Field Management System</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight">Empowering Modern Agriculture</h2>
          <p className="text-emerald-100 text-lg max-w-lg leading-relaxed">
            Efficiently manage crop seasons, track field agents, and optimize harvest results with our comprehensive platform.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sprout size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shamba Records</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8 text-lg">
              Sign in to manage your fields
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={20} />
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

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700">Sign up</Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={16} />
                Demo Accounts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Admin</span>
                  <span className="font-mono text-gray-800 text-xs">admin@smartseason.com / Admin@1234</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 font-medium">Agent</span>
                  <span className="font-mono text-gray-800 text-xs">agent@smartseason.com / Agent@1234</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
