import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MonthContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  year: number;
  month: number;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  resetToCurrentMonth: () => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  // Default to current month - resets on page reload
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed

  const goToPrevMonth = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  return (
    <MonthContext.Provider value={{
      selectedDate,
      setSelectedDate,
      year,
      month,
      goToPrevMonth,
      goToNextMonth,
      resetToCurrentMonth,
    }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}
