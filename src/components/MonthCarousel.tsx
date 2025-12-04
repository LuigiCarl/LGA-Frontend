import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonth } from '../context/MonthContext';

interface MonthCarouselProps {
  /** If true, allows navigating to future months (default: true) */
  allowFuture?: boolean;
}

export function MonthCarousel({ allowFuture = true }: MonthCarouselProps) {
  const { selectedDate, goToPrevMonth, goToNextMonth } = useMonth();
  
  const monthYear = selectedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && 
                         selectedDate.getFullYear() === new Date().getFullYear();

  // Disable next button only if we're at current month AND future is not allowed
  const isNextDisabled = !allowFuture && isCurrentMonth;

  const handleNextMonth = () => {
    if (!isNextDisabled) {
      goToNextMonth();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={goToPrevMonth}
        className="p-1.5 rounded-lg hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
      </button>
      <span className="text-sm font-medium text-[#0A0A0A] dark:text-white min-w-[130px] text-center select-none">
        {monthYear}
      </span>
      <button
        onClick={handleNextMonth}
        disabled={isNextDisabled}
        className={`p-1.5 rounded-lg transition-colors ${
          isNextDisabled 
            ? 'opacity-30 cursor-not-allowed' 
            : 'hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]'
        }`}
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4 text-[#717182] dark:text-[#A1A1AA]" />
      </button>
    </div>
  );
}
