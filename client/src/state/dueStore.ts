import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DueRequest {
  id: string;
  type: 'snapshot' | 'deep_dive';
  companyNumber?: string;
  companyName: string;
  companyUrl?: string;
  jurisdiction: string;
  requestedBy: string;
  createdAt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  sla: 'fast' | 'extended';
  inputs: {
    reason: string;
    includeFinancialAnalysis: boolean;
    includeRiskAssessment: boolean;
    includeMarketPosition: boolean;
    includeComplianceCheck: boolean;
    attachments: string[];
  };
  result?: {
    reportId: string;
    summary: string;
    scorecard: {
      filingHealth: string;
      redFlags: number;
      webScore: number;
    };
    downloadUrl: string;
    openUrl: string;
  };
  error?: string;
}

interface DueStore {
  requests: DueRequest[];
  createRequest: (payload: Omit<DueRequest, 'id' | 'createdAt' | 'status' | 'progress'>) => string;
  updateRequest: (id: string, updates: Partial<DueRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestById: (id: string) => DueRequest | undefined;
  getRecentRequests: (limit: number) => DueRequest[];
}

const generateId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateResult = (type: 'snapshot' | 'deep_dive', companyName: string) => {
  const isSuccess = Math.random() > 0.1; // 90% success rate
  
  if (!isSuccess) return undefined;

  return {
    reportId: `${type === 'snapshot' ? 'snap' : 'deep'}_${Date.now()}`,
    summary: `Analysis complete for ${companyName}. ${type === 'snapshot' ? 'Clean filings; low governance risk; moderate web footprint.' : 'Comprehensive analysis shows strong fundamentals with minor risk factors identified.'}`,
    scorecard: {
      filingHealth: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
      redFlags: Math.floor(Math.random() * 3),
      webScore: 60 + Math.floor(Math.random() * 40)
    },
    downloadUrl: '#',
    openUrl: '#'
  };
};

const processRequest = (
  requestId: string, 
  type: 'snapshot' | 'deep_dive', 
  companyName: string,
  updateRequest: (id: string, updates: Partial<DueRequest>) => void
) => {
  const sla = type === 'snapshot' ? 'fast' : 'extended';
  const processingDelay = type === 'snapshot' ? 3000 + Math.random() * 7000 : 10000 + Math.random() * 10000;
  const completionTime = type === 'snapshot' ? 45000 : 90000;

  // Start processing
  setTimeout(() => {
    updateRequest(requestId, { status: 'processing', progress: 10 });
    
    // Progress updates
    const progressInterval = setInterval(() => {
      updateRequest(requestId, { 
        progress: Math.min(95, Math.floor(Math.random() * 20) + 30)
      });
    }, 5000);

    // Complete
    setTimeout(() => {
      clearInterval(progressInterval);
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const result = generateResult(type, companyName);
        updateRequest(requestId, { 
          status: 'completed', 
          progress: 100,
          result
        });
      } else {
        updateRequest(requestId, { 
          status: 'failed', 
          progress: 0,
          error: 'Analysis failed due to insufficient data. Please try again.'
        });
      }
    }, completionTime - processingDelay);
    
  }, processingDelay);
};

// Sample data for development
const sampleRequests: DueRequest[] = [
  {
    id: 'req_001',
    type: 'snapshot',
    companyName: 'TechFlow Solutions Ltd',
    companyNumber: '12345678',
    jurisdiction: 'UK',
    requestedBy: 'John Smith',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    progress: 100,
    sla: 'fast',
    inputs: {
      reason: 'Investment due diligence',
      includeFinancialAnalysis: true,
      includeRiskAssessment: true,
      includeMarketPosition: true,
      includeComplianceCheck: true,
      attachments: []
    },
    result: {
      reportId: 'snap_1234567890',
      summary: 'Clean filings; low governance risk; moderate web footprint.',
      scorecard: {
        filingHealth: 'Excellent',
        redFlags: 0,
        webScore: 85
      },
      downloadUrl: '#',
      openUrl: '#'
    }
  },
  {
    id: 'req_002',
    type: 'deep_dive',
    companyName: 'GreenEnergy Ventures',
    companyNumber: '87654321',
    jurisdiction: 'UK',
    requestedBy: 'Sarah Wilson',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'processing',
    progress: 75,
    sla: 'extended',
    inputs: {
      reason: 'Acquisition assessment',
      includeFinancialAnalysis: true,
      includeRiskAssessment: true,
      includeMarketPosition: true,
      includeComplianceCheck: true,
      attachments: []
    }
  },
  {
    id: 'req_003',
    type: 'snapshot',
    companyName: 'DataMind Analytics',
    companyNumber: '11223344',
    jurisdiction: 'UK',
    requestedBy: 'Mike Johnson',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    progress: 100,
    sla: 'fast',
    inputs: {
      reason: 'Partnership evaluation',
      includeFinancialAnalysis: true,
      includeRiskAssessment: false,
      includeMarketPosition: true,
      includeComplianceCheck: true,
      attachments: []
    },
    result: {
      reportId: 'snap_1234567891',
      summary: 'Emerging company with high growth potential. Some regulatory concerns.',
      scorecard: {
        filingHealth: 'Good',
        redFlags: 2,
        webScore: 72
      },
      downloadUrl: '#',
      openUrl: '#'
    }
  },
  {
    id: 'req_004',
    type: 'snapshot',
    companyName: 'RetailMax Group',
    companyNumber: '55667788',
    jurisdiction: 'UK',
    requestedBy: 'Emma Davis',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'queued',
    progress: 0,
    sla: 'fast',
    inputs: {
      reason: 'Vendor assessment',
      includeFinancialAnalysis: true,
      includeRiskAssessment: true,
      includeMarketPosition: false,
      includeComplianceCheck: true,
      attachments: []
    }
  },
  {
    id: 'req_005',
    type: 'deep_dive',
    companyName: 'FinTech Innovations Inc',
    companyNumber: '99887766',
    jurisdiction: 'UK',
    requestedBy: 'Alex Brown',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'failed',
    progress: 0,
    sla: 'extended',
    inputs: {
      reason: 'Investment screening',
      includeFinancialAnalysis: true,
      includeRiskAssessment: true,
      includeMarketPosition: true,
      includeComplianceCheck: true,
      attachments: []
    },
    error: 'Company data not available in public records'
  }
];

export const useDueStore = create<DueStore>()(
  persist(
    (set, get) => ({
      requests: sampleRequests,
      
      createRequest: (payload) => {
        const id = generateId();
        const request: DueRequest = {
          ...payload,
          id,
          createdAt: new Date().toISOString(),
          status: 'queued',
          progress: 0
        };
        
        set((state) => ({
          requests: [request, ...state.requests]
        }));

        // Start processing simulation
        processRequest(id, payload.type, payload.companyName, get().updateRequest);
        
        return id;
      },
      
      updateRequest: (id, updates) => {
        set((state) => ({
          requests: state.requests.map(req => 
            req.id === id ? { ...req, ...updates } : req
          )
        }));
      },
      
      deleteRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter(req => req.id !== id)
        }));
      },
      
      getRequestById: (id: string) => {
        return get().requests.find(req => req.id === id);
      },
      
      getRecentRequests: (limit: number) => {
        return get().requests
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      }
    }),
    {
      name: 'unlock_due_requests_v2',
      version: 2
    }
  )
);

// Hooks for common use cases
export const useRequests = () => useDueStore(state => state.requests);
export const useRequestById = (id: string) => useDueStore(state => state.requests.find(req => req.id === id));
export const useRecentRequests = (limit: number = 5) => useDueStore(state => 
  state.requests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
);