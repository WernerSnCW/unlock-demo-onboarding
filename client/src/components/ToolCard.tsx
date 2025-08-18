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
  iconColor = "text-blue-600", 
  title, 
  description, 
  actionText, 
  isLocked = false, 
  isPremium = false,
  onClick 
}: ToolCardProps) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
      p-6 hover:shadow-lg transition-all duration-200 relative
      ${isLocked ? 'opacity-75' : 'hover:border-blue-300 dark:hover:border-blue-600'}
    `}>
      
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3">
          <span className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-medium">
            <i className="fas fa-crown mr-1" aria-hidden="true"></i>
            Pro
          </span>
        </div>
      )}

      {/* Lock Icon for Locked Tools */}
      {isLocked && (
        <div className="absolute top-3 right-3">
          <i className="fas fa-lock text-gray-400 text-sm" aria-hidden="true"></i>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-full">
        
        {/* Icon */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <i className={`${icon} text-2xl ${iconColor}`} aria-hidden="true"></i>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-1">
          {description}
        </p>

        {/* Action Button */}
        <button
          onClick={onClick}
          disabled={isLocked}
          className={`
            w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
            ${isLocked 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
            }
          `}
        >
          {isLocked ? (
            <>
              <i className="fas fa-lock mr-2" aria-hidden="true"></i>
              Preview Only
            </>
          ) : (
            actionText
          )}
        </button>

      </div>
    </div>
  );
}