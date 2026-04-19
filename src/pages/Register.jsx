import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sprout, User, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);

  const { register, login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(
        user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard',
        { replace: true }
      );
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
      setPasswordError('Security requirement: 8+ chars, uppercase, lowercase, number, symbol');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      
      // Auto-login after registration
      await login(formData.email, formData.password);
      
      navigate(formData.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-layout">
      {/* Left Side - Image/Content (Desktop) */}
      <div className="auth-side animate-fade-in">
        <div className="auth-side-bg">
          <img 
            src="https://images.unsplash.com/photo-1594919507949-1667d4f90117?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Farming community" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="auth-side-overlay" />
        
        <div className="auth-side-content">
          <div className="auth-side-logo">
            <div className="auth-side-logo-icon">
              <Sprout size={24} />
            </div>
            <h1>Shamba Records</h1>
          </div>
          
          <div className="auth-side-hero">
            <div className="animate-slide-up stagger-1">
              <h2>Join Our Agricultural Network.</h2>
            </div>
            <div className="animate-slide-up stagger-2">
              <p>
                Take the first step towards smarter field management. Connect 
                with agents, monitor crop progress, and scale your operations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="auth-side-footer animate-fade-in stagger-3">
          &copy; 2026 Shamba Records. Professional Field Management.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-content overflow-y-auto">
        <div className="auth-form-container my-12">
          {/* Mobile Logo */}
          <div className="auth-mobile-logo animate-fade-in border-b border-light pb-6 mb-8 w-full flex justify-center">
             <div className="flex items-center gap-3">
                <div className="auth-mobile-logo-icon bg-primary-600 shadow-lg shadow-primary-500/20">
                  <Sprout size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black tracking-tighter text-primary">Shamba Records</h1>
             </div>
          </div>

          <div className="auth-header animate-slide-up stagger-1">
            <h2 className="text-3xl font-black text-primary tracking-tighter">Create Account</h2>
            <p className="text-secondary font-medium">
              Join our network or{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline underline-offset-4 decoration-2">sign in if you have an account</Link>
            </p>
          </div>

          <form className="space-y-6 animate-slide-up stagger-2" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                type="text"
                icon={User}
                required
                placeholder="First and last name"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                required
                placeholder="Secret phrase"
                value={formData.password}
                onChange={handleChange}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                icon={ShieldCheck}
                required
                placeholder="Repeat phrase"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={passwordError}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                 Designated Operational Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`group flex flex-col gap-2 p-4 rounded-3xl border-2 cursor-pointer transition-all duration-500 relative overflow-hidden
                      ${formData.role === role.value
                        ? 'border-primary-600 bg-white shadow-xl shadow-primary-900/5 ring-1 ring-primary-600'
                        : 'border-light bg-earth-50/30 hover:border-primary-300 hover:bg-white'
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
                    
                    {formData.role === role.value && (
                       <div className="absolute top-0 right-0 w-12 h-12 bg-primary-600 rounded-bl-[100%] flex items-center justify-center pl-3 pb-3">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                       </div>
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      <span className={`text-xs font-black uppercase tracking-widest ${
                        formData.role === role.value ? 'text-primary-600' : 'text-primary-800'
                      }`}>
                        {role.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium leading-relaxed text-secondary/80 relative z-10">
                      {role.description}
                    </span>
                    
                    {/* Hover Decoration */}
                    <div className={`absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-2xl transition-all duration-500
                      ${formData.role === role.value ? 'bg-primary-100 opacity-100' : 'bg-primary-50 opacity-0 group-hover:opacity-100'}`} />
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-error-50 border border-error-100 text-error-700 animate-shake shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-2 shadow-xl shadow-primary-500/10 active:scale-[0.98] transition-all"
              size="lg"
            >
              Initialize Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
