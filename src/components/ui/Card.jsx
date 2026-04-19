const Card = ({ children, className = '', padding = 'lg', shadow = 'md' }) => {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowStyles = {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: '',
  };

  return (
    <div
      className={`bg-primary rounded-xl border border-light transition-all duration-fast hover:shadow-md ${shadowStyles[shadow]} ${className}`}
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
  <h3 className={`text-lg font-semibold text-primary ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`mt-1 text-sm text-secondary ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-6 border-t border-light flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
