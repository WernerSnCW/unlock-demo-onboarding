import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Investor {
  userId: string;
  name: string;
  investorType: string;
}

interface InvestorContextType {
  selectedInvestor: Investor | null;
  setSelectedInvestor: (investor: Investor | null) => void;
}

const InvestorContext = createContext<InvestorContextType | undefined>(undefined);

export function InvestorProvider({ children }: { children: ReactNode }) {
  const [selectedInvestor, setSelectedInvestorState] = useState<Investor | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedInvestor');
    if (stored) {
      try {
        setSelectedInvestorState(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored investor:', error);
        localStorage.removeItem('selectedInvestor');
      }
    }
  }, []);

  // Save to localStorage whenever selection changes
  const setSelectedInvestor = (investor: Investor | null) => {
    setSelectedInvestorState(investor);
    if (investor) {
      localStorage.setItem('selectedInvestor', JSON.stringify(investor));
    } else {
      localStorage.removeItem('selectedInvestor');
    }
  };

  return (
    <InvestorContext.Provider value={{ selectedInvestor, setSelectedInvestor }}>
      {children}
    </InvestorContext.Provider>
  );
}

export function useInvestor() {
  const context = useContext(InvestorContext);
  if (context === undefined) {
    throw new Error('useInvestor must be used within an InvestorProvider');
  }
  return context;
}