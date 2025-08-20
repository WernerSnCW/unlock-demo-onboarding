import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Info } from 'lucide-react';

interface InfoPopoverProps {
  title: string;
  children: ReactNode;
  trigger?: ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function InfoPopover({ 
  title, 
  children, 
  trigger, 
  className = '', 
  side = 'top',
  align = 'center'
}: InfoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size="sm" 
      className={`h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ${className}`}
      aria-label={`Information about ${title}`}
    >
      <Info className="h-4 w-4" />
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || defaultTrigger}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
        side={side}
        align={align}
        onInteractOutside={() => setIsOpen(false)}
      >
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {title}
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {children}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}