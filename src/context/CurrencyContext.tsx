import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'PHP' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW' | 'AUD' | 'CAD' | 'SGD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  KRW: { code: 'KRW', symbol: '₩', name: 'Korean Won', locale: 'ko-KR' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyInfo: CurrencyInfo;
  setCurrency: (currency: CurrencyCode) => void;
  formatCurrency: (amount: number | string, showSign?: boolean, type?: 'income' | 'expense') => string;
  useCompactNumbers: boolean;
  setUseCompactNumbers: (value: boolean) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred_currency';
const COMPACT_KEY = 'use_compact_numbers';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as CurrencyCode) || 'PHP';
  });

  const [useCompactNumbers, setUseCompactNumbersState] = useState<boolean>(() => {
    const stored = localStorage.getItem(COMPACT_KEY);
    return stored === 'true';
  });

  const currencyInfo = CURRENCIES[currency];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(COMPACT_KEY, String(useCompactNumbers));
  }, [useCompactNumbers]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
  };

  const setUseCompactNumbers = (value: boolean) => {
    setUseCompactNumbersState(value);
  };

  const formatCurrency = (
    amount: number | string,
    showSign: boolean = false,
    type?: 'income' | 'expense'
  ): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const absAmount = Math.abs(numAmount);
    
    // Use compact notation for large numbers if enabled
    const notation = useCompactNumbers && absAmount >= 1000 ? 'compact' : 'standard';
    
    // Use Intl.NumberFormat for proper formatting
    const formatter = new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      notation,
      minimumFractionDigits: notation === 'compact' ? 0 : (currencyInfo.code === 'JPY' || currencyInfo.code === 'KRW' ? 0 : 2),
      maximumFractionDigits: notation === 'compact' ? 1 : (currencyInfo.code === 'JPY' || currencyInfo.code === 'KRW' ? 0 : 2),
    });

    const formatted = formatter.format(absAmount);

    if (showSign && type) {
      const sign = type === 'income' ? '+' : '-';
      return `${sign}${formatted}`;
    }

    return formatted;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencyInfo, setCurrency, formatCurrency, useCompactNumbers, setUseCompactNumbers }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
