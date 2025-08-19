import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QnaAnswer {
  id: string;
  author: {
    id: string;
    role: 'investor' | 'lead' | 'company';
    verified?: boolean;
    name?: string;
  };
  body: string;
  createdAt: string;
}

interface QnaQuestion {
  id: string;
  target: 'company' | 'lead' | 'community';
  body: string;
  author: {
    id: string;
    role: 'investor' | 'lead' | 'company';
    verified?: boolean;
    name?: string;
  };
  createdAt: string;
  upvotes: number;
  followers: number;
  status: 'open' | 'answered' | 'closed';
  answers: QnaAnswer[];
  upvotedBy?: string[];
  followedBy?: string[];
}

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
  // Enhanced business context
  businessContext: {
    industry: string;
    sector: string;
    location: string;
    headquarters: string;
    logo?: string;
    size: 'Micro' | 'Small' | 'Medium' | 'Large';
    employeeCount?: number;
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
    // Enhanced insights
    confidenceScore: number; // 0-100
    coverageScore: number; // 0-100
    turnaroundTime: number; // minutes
  };
  error?: string;
  errorDetails?: {
    type: 'not_found' | 'insufficient_data' | 'technical_error';
    message: string;
    suggestions: string[];
  };
  businessId?: string;
  qna?: {
    questions: QnaQuestion[];
  };
  activity?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface DueStore {
  requests: DueRequest[];
  createRequest: (payload: Omit<DueRequest, 'id' | 'createdAt' | 'status' | 'progress'>) => string;
  updateRequest: (id: string, updates: Partial<DueRequest>) => void;
  deleteRequest: (id: string) => void;
  getRequestById: (id: string) => DueRequest | undefined;
  getRecentRequests: (limit: number) => DueRequest[];
  
  // Q&A methods
  addQuestion: (requestId: string, question: { body: string; target: 'company' | 'lead' | 'community' }) => void;
  addAnswer: (requestId: string, questionId: string, body: string) => void;
  toggleUpvote: (requestId: string, questionId: string, userId: string) => void;
  toggleFollow: (requestId: string, questionId: string, userId: string) => void;
  markAnswered: (requestId: string, questionId: string, answerId: string) => void;
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
    businessId: 'biz_001',
    businessContext: {
      industry: 'Technology',
      sector: 'Software Development',
      location: 'UK',
      headquarters: 'London',
      size: 'Medium',
      employeeCount: 150
    },
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
      openUrl: '#',
      confidenceScore: 94,
      coverageScore: 87,
      turnaroundTime: 15
    },
    qna: {
      questions: [
        {
          id: 'q_7001',
          target: 'company',
          body: 'Can you clarify gross margin assumptions for FY+1? The report shows strong projections but I\'d like to understand the underlying cost structure.',
          author: { 
            id: 'u_angel_01', 
            role: 'investor',
            name: 'Angela Rodriguez'
          },
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          upvotes: 12,
          followers: 5,
          status: 'answered',
          upvotedBy: ['u_investor_02', 'u_investor_03'],
          followedBy: ['u_investor_02', 'u_investor_04', 'u_investor_05'],
          answers: [
            {
              id: 'a_9101',
              author: { 
                id: 'u_co_01', 
                role: 'company', 
                verified: true,
                name: 'David Chen (CFO)'
              },
              body: 'Target 62% blended gross margin based on our current product mix. Key drivers: 45% for consulting services, 78% for SaaS platform. We\'ve modeled conservative 3% annual efficiency gains. Sensitivity analysis available on request.',
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'q_7002', 
          target: 'lead',
          body: 'What\'s your take on the competitive landscape assessment? The market positioning seems optimistic.',
          author: {
            id: 'u_investor_02',
            role: 'investor', 
            name: 'Michael Foster'
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          upvotes: 8,
          followers: 3,
          status: 'answered',
          upvotedBy: ['u_angel_01', 'u_investor_04'],
          followedBy: ['u_angel_01', 'u_investor_03'],
          answers: [
            {
              id: 'a_9102',
              author: {
                id: 'u_lead_01',
                role: 'lead',
                name: 'Sarah Williams (Lead Investor)'
              },
              body: 'Agreed the market is competitive, but TechFlow has clear differentiation in mid-market segment. Their API-first approach and vertical integrations create switching costs. We see 18-month lead on closest competitor.',
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'q_7003',
          target: 'community',
          body: 'Has anyone done due diligence on similar SaaS companies in this space? Looking for benchmark data.',
          author: {
            id: 'u_investor_03',
            role: 'investor',
            name: 'James Liu'
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          upvotes: 4,
          followers: 2,
          status: 'open',
          upvotedBy: ['u_investor_02'],
          followedBy: ['u_angel_01'],
          answers: []
        }
      ]
    },
    activity: [
      {
        id: 'activity_001',
        type: 'request_created',
        description: 'Due diligence request created',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'activity_002', 
        type: 'analysis_completed',
        description: 'Analysis completed successfully',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
      },
      {
        id: 'activity_003',
        type: 'question_added', 
        description: 'Question added: Can you clarify gross margin assumptions for FY+1?',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'activity_004',
        type: 'company_answered',
        description: 'Company answered',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
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
    businessContext: {
      industry: 'Energy',
      sector: 'Renewable Energy',
      location: 'UK',
      headquarters: 'Edinburgh',
      size: 'Small',
      employeeCount: 45
    },
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
    businessContext: {
      industry: 'Technology',
      sector: 'Data Analytics',
      location: 'UK',
      headquarters: 'Manchester',
      size: 'Small',
      employeeCount: 25
    },
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
      openUrl: '#',
      confidenceScore: 78,
      coverageScore: 82,
      turnaroundTime: 12
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
    businessContext: {
      industry: 'Retail',
      sector: 'Consumer Goods',
      location: 'UK',
      headquarters: 'Birmingham',
      size: 'Large',
      employeeCount: 850
    },
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
    businessContext: {
      industry: 'Financial Services',
      sector: 'FinTech',
      location: 'UK',
      headquarters: 'London',
      size: 'Medium',
      employeeCount: 120
    },
    inputs: {
      reason: 'Investment screening',
      includeFinancialAnalysis: true,
      includeRiskAssessment: true,
      includeMarketPosition: true,
      includeComplianceCheck: true,
      attachments: []
    },
    error: 'Company data not available in public records',
    errorDetails: {
      type: 'not_found',
      message: 'Company not found in Companies House registry',
      suggestions: [
        'Verify company number is correct',
        'Check if company is registered in different jurisdiction',
        'Try searching by company name instead'
      ]
    }
  }
];

export const useDueStore = create<DueStore>()(
  persist(
    (set, get) => ({
      requests: sampleRequests,
      
      createRequest: (payload) => {
        const id = generateId();
        
        // Generate business context based on company name patterns
        const generateBusinessContext = (companyName: string): DueRequest['businessContext'] => {
          const industries = [
            { industry: 'Technology', sector: 'Software Development' },
            { industry: 'Financial Services', sector: 'FinTech' },
            { industry: 'Healthcare', sector: 'Medical Technology' },
            { industry: 'Retail', sector: 'E-commerce' },
            { industry: 'Energy', sector: 'Renewable Energy' },
            { industry: 'Manufacturing', sector: 'Industrial Equipment' }
          ];
          
          const locations = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Cambridge'];
          const sizes: Array<'Micro' | 'Small' | 'Medium' | 'Large'> = ['Micro', 'Small', 'Medium', 'Large'];
          
          const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
          
          const employeeRanges = {
            'Micro': [1, 10],
            'Small': [11, 50],
            'Medium': [51, 250],
            'Large': [251, 1000]
          };
          
          const [min, max] = employeeRanges[randomSize];
          const employeeCount = Math.floor(Math.random() * (max - min + 1)) + min;
          
          return {
            industry: randomIndustry.industry,
            sector: randomIndustry.sector,
            location: 'UK',
            headquarters: randomLocation,
            size: randomSize,
            employeeCount
          };
        };

        const request: DueRequest = {
          ...payload,
          id,
          createdAt: new Date().toISOString(),
          status: 'queued',
          progress: 0,
          businessContext: generateBusinessContext(payload.companyName)
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