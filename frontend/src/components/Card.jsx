const Card = ({ 
  children, 
  hoverable = false, 
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl border border-slate-200 shadow-sm p-6';
  const hoverClasses = hoverable 
    ? 'hover:shadow-md hover:border-primary-200 transition-all cursor-pointer' 
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

