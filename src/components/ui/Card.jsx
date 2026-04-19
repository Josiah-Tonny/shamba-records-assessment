const Card = ({ children, className = '', shadow = 'md' }) => {
  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: '',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 transition-all duration-200 hover:shadow-lg ${shadowStyles[shadow]} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`mt-1 text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-6 border-t border-gray-200 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
