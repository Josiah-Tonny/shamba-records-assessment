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
      
      // Redirect based on role
      if (userRes.role === 'admin') {
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
    <div className="auth-layout">
      {/* Left Side - Image/Content (Desktop) */}
      <div className="auth-side animate-fade-in">
        <div className="auth-side-bg">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Agriculture field" 
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
              <h2>Empowering Modern Agriculture.</h2>
            </div>
            <div className="animate-slide-up stagger-2">
              <p>
                Efficiently manage crop seasons, track field agents, and optimize 
                harvest results with our comprehensive management system.
              </p>
            </div>
          </div>
        </div>
        
        <div className="auth-side-footer animate-fade-in stagger-3">
          &copy; 2026 Shamba Records. Professional Field Management.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-content">
        <div className="auth-form-container">
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
            <h2 className="text-3xl font-black text-primary tracking-tighter">Welcome Back</h2>
            <p className="text-secondary font-medium">
              Sign in to manage your fields or{' '}
              <Link to="/register" className="text-primary-600 font-bold hover:underline underline-offset-4 decoration-2">create a new account</Link>
            </p>
          </div>

          <form className="space-y-6 animate-slide-up stagger-2" onSubmit={handleSubmit}>
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
              placeholder="Enter your security phrase"
              value={formData.password}
              onChange={handleChange}
            />

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-error-50 border border-error-100 text-error-700 animate-shake shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
              size="lg"
            >
              System Authentication
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="auth-demo animate-fade-in stagger-3 mt-10 p-6 rounded-3xl border border-light bg-white shadow-xl shadow-earth-200/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
              Standard Training Access
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-50/50 border border-light/50 group hover:bg-white hover:shadow-sm transition-all">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Administrator</span>
                  <span className="text-xs font-black text-primary">admin@smartseason.com</span>
                </div>
                <div className="text-[10px] font-bold text-muted group-hover:text-primary-600 transition-colors">Admin@1234</div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-earth-50/50 border border-light/50 group hover:bg-white hover:shadow-sm transition-all">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-0.5">Field Agent</span>
                  <span className="text-xs font-black text-primary">agent@smartseason.com</span>
                </div>
                <div className="text-[10px] font-bold text-muted group-hover:text-primary-600 transition-colors">Agent@1234</div>
              </div>
            </div>
            
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold text-muted italic">
              <Info className="w-3 h-3" />
              Authorized training credentials only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
