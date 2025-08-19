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

export const useDueStore = create<DueStore>()(
  persist(
    (set, get) => ({
      requests: [],
      
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
      name: 'unlock_due_requests_v1',
      version: 1
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