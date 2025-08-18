interface ToolCardProps {
  icon: string;
  iconColor?: string;
  title: string;
  description: string;
  actionText: string;
  isLocked?: boolean;
  isPremium?: boolean;
  onClick: () => void;
}

export default function ToolCard({ 
  icon, 
  iconColor = "text-[#5193B3]", 
  title, 
  description, 
  actionText, 
  isLocked = false, 
  isPremium = false,
  onClick 
}: ToolCardProps) {
  const getCardTheme = () => {
    if (isPremium && !isLocked) {
      return {
        background: 'bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-blue-900/30 dark:via-gray-800 dark:to-teal-900/30',
        border: 'border-[#5193B3]/30 dark:border-[#5193B3]/50',
        hoverBorder: 'hover:border-[#5193B3] dark:hover:border-[#62C4C3]',
        shadow: 'hover:shadow-xl hover:shadow-[#5193B3]/20 dark:hover:shadow-[#62C4C3]/20'
      };
    }
    
    if (isLocked) {
      return {
        background: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
        border: 'border-gray-300 dark:border-gray-600',
        hoverBorder: '',
        shadow: 'hover:shadow-md'
      };
    }
    
    return {
      background: 'bg-gradient-to-br from-white via-blue-50/30 to-teal-50/30 dark:from-gray-800 dark:via-blue-900/20 dark:to-teal-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      hoverBorder: 'hover:border-[#5193B3]/60 dark:hover:border-[#62C4C3]/60',
      shadow: 'hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/50'
    };
  };

  const theme = getCardTheme();

  return (
    <div className={`
      ${theme.background} rounded-xl border ${theme.border} 
      p-6 transition-all duration-300 relative group
      ${!isLocked ? `${theme.hoverBorder} ${theme.shadow} hover:-translate-y-1` : 'opacity-75'}
    `}>
      
      {/* Premium Badge for Premium Tools or Locked Tools */}
      {(isPremium || isLocked) && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="inline-block bg-gradient-to-r from-[#F8D49B] to-[#62C4C3] text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            <i className="fas fa-crown mr-1" aria-hidden="true"></i>
            PRO
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-full">
        
        {/* Icon with Brand Colors */}
        <div className="mb-4">
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden
            ${(isPremium || isLocked)
              ? 'bg-gradient-to-br from-[#5193B3] to-[#62C4C3] shadow-lg' 
              : 'bg-gradient-to-br from-[#5193B3]/10 to-[#62C4C3]/10 border border-[#5193B3]/20 dark:border-[#62C4C3]/20'
            }
          `}>
            <i className={`
              ${icon} text-2xl transition-transform duration-200 group-hover:scale-110
              ${(isPremium || isLocked)
                ? 'text-white' 
                : iconColor || 'text-[#5193B3] dark:text-[#62C4C3]'
              }
            `} aria-hidden="true"></i>
            
            {/* Subtle shine effect for premium/locked */}
            {(isPremium || isLocked) && (
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
          </div>
        </div>

        {/* Title with Brand Colors */}
        <h3 className={`
          text-lg font-semibold mb-2 transition-colors duration-200
          ${(isPremium || isLocked)
            ? 'text-[#5193B3] dark:text-[#62C4C3]' 
            : 'text-gray-800 dark:text-gray-100 group-hover:text-[#5193B3] dark:group-hover:text-[#62C4C3]'
          }
        `}>
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        {/* Enhanced Action Button */}
        <button
          onClick={onClick}
          disabled={isLocked}
          className={`
            w-full py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
            ${isLocked 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
              : (isPremium || isLocked)
                ? 'bg-gradient-to-r from-[#5193B3] to-[#62C4C3] hover:from-[#4A85A3] hover:to-[#58B4B3] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-[#5193B3] hover:bg-[#4A85A3] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }
          `}
        >
          {isLocked ? (
            <>
              <i className="fas fa-lock text-sm" aria-hidden="true"></i>
              Preview Only
            </>
          ) : (
            <>
              <span>{actionText}</span>
              <i className="fas fa-arrow-right text-xs opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" aria-hidden="true"></i>
            </>
          )}
        </button>

      </div>
    </div>
  );
}