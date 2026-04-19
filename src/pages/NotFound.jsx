import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, ArrowLeft, Compass } from 'lucide-react';

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const homeRoute = !isAuthenticated
    ? '/login'
    : user?.role === 'admin'
    ? '/admin/dashboard'
    : '/agent/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[var(--primary-100)] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[var(--primary-100)] opacity-30 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-light)] shadow-sm flex items-center justify-center">
              <Compass className="w-12 h-12 text-[var(--primary-400)]" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-[var(--primary-600)] flex items-center justify-center shadow">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl font-black text-[var(--primary-600)] tracking-tighter leading-none mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
          Page not found
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                       border border-[var(--border-default)] bg-[var(--bg-primary)]
                       text-sm font-semibold text-[var(--text-primary)]
                       hover:bg-[var(--bg-secondary)] hover:border-[var(--border-default)]
                       transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to={homeRoute}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                       bg-[var(--primary-600)] hover:bg-[var(--primary-700)]
                       text-sm font-semibold text-white
                       transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-xs text-[var(--text-muted)]">
          SmartSeason Field Monitoring System
        </p>
      </div>
    </div>
  );
};

export default NotFound;
