import { useRoute } from 'wouter';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Download, ExternalLink, RotateCcw, Trash2, Check, Lock, Building2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusPill } from '@/components/due/StatusPill';
import { Timeline } from '@/components/due/Timeline';
import { useRequestById, useDueStore } from '@/state/dueStore';
import { useToast } from '@/hooks/use-toast';
import ReportQnA from '@/components/qna/ReportQnA';
import currentUserData from '@/mocks/currentUser.json';

export default function DueDiligenceRequestDetail() {
  const [, params] = useRoute('/due-diligence/requests/:id');
  const { toast } = useToast();
  const { createRequest, deleteRequest, addQuestion, addAnswer, toggleUpvote, toggleFollow, markAnswered } = useDueStore();
  const request = useRequestById(params?.id || '');

  if (!request) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Request Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The request you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/due-diligence">
              <Button>Back to Due Diligence</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleRetry = () => {
    const newRequestId = createRequest({
      type: request.type,
      companyName: request.companyName,
      companyNumber: request.companyNumber,
      companyUrl: request.companyUrl,
      jurisdiction: request.jurisdiction,
      requestedBy: request.requestedBy,
      sla: request.sla,
      businessContext: request.businessContext,
      inputs: request.inputs
    });

    toast({
      title: "Request Retried",
      description: "A new request has been created with the same parameters.",
    });

    // Navigate to the new request
    window.history.pushState({}, '', `/due-diligence/requests/${newRequestId}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      deleteRequest(request.id);
      toast({
        title: "Request Deleted",
        description: "The request has been removed from your history.",
      });
      // Navigate back to requests list
      window.history.pushState({}, '', '/due-diligence/requests');
    }
  };

  // Q&A handlers
  const handleQuestionSubmit = (question: { body: string; target: 'company' | 'lead' | 'community' }) => {
    addQuestion(request.id, question);
  };

  const handleUpvote = (questionId: string) => {
    toggleUpvote(request.id, questionId, currentUserData.id);
  };

  const handleFollow = (questionId: string) => {
    toggleFollow(request.id, questionId, currentUserData.id);
  };

  const handleAnswer = (questionId: string, body: string) => {
    addAnswer(request.id, questionId, body);
  };

  const handleMarkAnswered = (questionId: string, answerId: string) => {
    markAnswered(request.id, questionId, answerId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/due-diligence/requests">
            <Button variant="ghost" className="mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-6 w-6 text-gray-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {request.companyName}
                </h1>
                {request.companyNumber && (
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {request.companyNumber}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  request.type === 'snapshot' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                }`}>
                  {request.type === 'snapshot' ? 'Snapshot' : 'Deep Dive'}
                  {request.type === 'deep_dive' && (
                    <Lock className="h-3 w-3 ml-1" />
                  )}
                </span>
                <span className="text-gray-600 dark:text-gray-400">{request.jurisdiction}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRetry} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-run
              </Button>
              <Button variant="outline" onClick={handleDelete} className="bg-white dark:bg-gray-800 text-red-600 hover:text-red-700 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
            <TabsTrigger value="qna" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Q&A
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {request.qna?.questions?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status & Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Status & Timeline</span>
                      <StatusPill status={request.status} />
                    </CardTitle>
                  </CardHeader>
              <CardContent className="space-y-6">
                {request.status === 'processing' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{request.progress}%</span>
                    </div>
                    <Progress value={request.progress} className="h-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      ETA: {request.sla === 'fast' ? '~45 seconds' : '~2 minutes'} (prototype)
                    </p>
                  </div>
                )}
                
                <Timeline request={request} />
              </CardContent>
            </Card>

            {/* Request Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Reason</h4>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{request.inputs.reason}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Included Checks</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {request.inputs.includeFinancialAnalysis && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Financial Analysis</span>
                      </div>
                    )}
                    {request.inputs.includeRiskAssessment && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Risk Assessment</span>
                      </div>
                    )}
                    {request.inputs.includeMarketPosition && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Market Position</span>
                      </div>
                    )}
                    {request.inputs.includeComplianceCheck && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Check</span>
                      </div>
                    )}
                  </div>
                </div>

                {request.inputs.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Attachments</h4>
                    <div className="space-y-1">
                      {request.inputs.attachments.map((filename, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          📎 {filename}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {request.status === 'completed' && request.result && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Summary</h4>
                    <p className="text-gray-600 dark:text-gray-400">{request.result.summary}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Scorecard</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {request.result.scorecard.filingHealth}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Filing Health</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {request.result.scorecard.redFlags}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Red Flags</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {request.result.scorecard.webScore}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Web Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Report
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {request.status === 'failed' && request.error && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Request Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{request.error}</p>
                  <Button onClick={handleRetry}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {request.type === 'deep_dive' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-600 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Premium Feature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Deep Dive analysis provides comprehensive insights including adverse media, beneficial ownership, and credit events.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            )}
              </div>
            </div>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="space-y-6">
            {request.status === 'completed' && request.result ? (
              <div className="space-y-6">
                {/* Report Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{request.companyName} - Due Diligence Report</CardTitle>
                        <p className="text-muted-foreground mt-1">
                          Comprehensive business intelligence snapshot generated on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {request.result.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Overall Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2">4.3/5.0</div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">Investment Score</div>
                        <div className="flex justify-center mt-2">
                          {[1, 2, 3, 4].map((star) => (
                            <span key={star} className="text-green-500 text-lg">★</span>
                          ))}
                          <span className="text-gray-300 text-lg">★</span>
                        </div>
                      </div>
                      
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">{request.result.confidenceScore}%</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Confidence</div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">Data Quality</div>
                      </div>
                      
                      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">{request.result.coverageScore}%</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Coverage</div>
                        <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">Completeness</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-400">Recommended for Investment</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Based on our analysis, TechFlow Solutions Ltd shows strong fundamentals with minimal risk factors. 
                        The company demonstrates solid financial health and regulatory compliance.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {request.result.scorecard.filingHealth}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Filing Health</div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">Current & Up-to-date</div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {request.result.scorecard.redFlags}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Red Flags</div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">Low Risk Profile</div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {request.result.scorecard.webScore}/10
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Web Presence</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Strong Digital Footprint</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Basic Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Company Number:</span>
                            <span className="font-medium">{request.companyNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Jurisdiction:</span>
                            <span className="font-medium">{request.jurisdiction}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                            <span className="font-medium">{request.businessContext.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Size:</span>
                            <span className="font-medium">{request.businessContext.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Business Context</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Headquarters:</span>
                            <span className="font-medium">{request.businessContext.headquarters}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Employees:</span>
                            <span className="font-medium">{request.businessContext.employeeCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Analysis Type:</span>
                            <span className="font-medium capitalize">{request.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Turnaround:</span>
                            <span className="font-medium">{request.result.turnaroundTime} minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  {request.status === 'processing' ? 'Analysis in progress...' : 'No results available yet'}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qna" className="space-y-6">
            <ReportQnA
              requestId={request.id}
              questions={request.qna?.questions || []}
              isCompleted={request.status === 'completed'}
              onQuestionSubmit={handleQuestionSubmit}
              onUpvote={handleUpvote}
              onFollow={handleFollow}
              onAnswer={handleAnswer}
              onMarkAnswered={handleMarkAnswered}
            />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline request={request} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </main>
      <Footer />
    </div>
  );
}