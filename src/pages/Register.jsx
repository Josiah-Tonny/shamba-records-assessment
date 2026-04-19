import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sprout, User, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ROLES = [
  { value: 'agent', label: 'Field Agent', description: 'Monitor and update assigned fields' },
  { value: 'admin', label: 'Administrator', description: 'Manage all fields, agents and reports' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
  });
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'confirmPassword' || name === 'password') {
      setPasswordError('');
      setError('');
    }
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      setPasswordError('Password must have 8+ chars, uppercase, lowercase, number, and symbol');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      await login(formData.email, formData.password);
      navigate(formData.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1594919507949-1667d4f90117?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
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
          <h2 className="text-5xl font-bold mb-6 leading-tight">Join Our Agricultural Network</h2>
          <p className="text-emerald-100 text-lg max-w-lg leading-relaxed">
            Take the first step towards smarter field management. Connect with agents and scale your operations.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sprout size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Shamba Records</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 lg:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 mb-8 text-lg">
              Join our network today
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  icon={User}
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  icon={Lock}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  icon={ShieldCheck}
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={passwordError}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <label
                      key={role.value}
                      className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all
                        ${formData.role === role.value
                          ? 'border-emerald-600 bg-emerald-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-white'
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
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${
                          formData.role === role.value ? 'text-emerald-700' : 'text-gray-700'
                        }`}>
                          {role.label}
                        </span>
                        {formData.role === role.value && (
                          <CheckCircle2 size={20} className="text-emerald-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 leading-relaxed">{role.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
