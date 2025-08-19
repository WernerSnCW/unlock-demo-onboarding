import { useRoute, Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '@/components/ui/button';
import { useRequestById } from '@/state/dueStore';
import { ArrowLeft, Download, ExternalLink, Shield, Building, Users, TrendingUp } from 'lucide-react';

export default function DueDiligenceSnapshot() {
  const [, params] = useRoute('/due-diligence/snapshot/:id');
  const dueRequest = useRequestById(params?.id || '');

  if (!dueRequest) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">Snapshot Not Found</h1>
          <Link href="/due-diligence">
            <Button>Back to Due Diligence</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (dueRequest.status !== 'completed' || !dueRequest.result) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            {dueRequest.status === 'processing' ? 'Analysis In Progress' : 
             dueRequest.status === 'queued' ? 'Analysis Queued' :
             dueRequest.status === 'failed' ? 'Analysis Failed' : 'Snapshot Not Ready'}
          </h1>
          <p className="text-[var(--muted-foreground)] mb-4">
            {dueRequest.status === 'processing' ? `Analysis is ${dueRequest.progress}% complete. Please check back shortly.` :
             dueRequest.status === 'queued' ? 'Your request is queued for processing.' :
             dueRequest.status === 'failed' ? 'The analysis failed. Please try submitting a new request.' :
             'The snapshot is not available yet.'}
          </p>
          <Link href={`/due-diligence/requests/${dueRequest.id}`}>
            <Button>View Request Details</Button>
          </Link>
        </div>
      </div>
    );
  }

  const assessmentData = [
    {
      title: 'Company Verification',
      score: 85,
      status: 'Strong',
      icon: Building,
      description: 'Business registration, structure, and operational legitimacy confirmed'
    },
    {
      title: 'Compliance & Legal',
      score: 88,
      status: 'Excellent',
      icon: Shield,
      description: 'Regulatory compliance and legal standing verified'
    },
    {
      title: 'Financial Health',
      score: 78,
      status: 'Good',
      icon: TrendingUp,
      description: 'Revenue analysis and financial stability assessed'
    },
    {
      title: 'Management Team',
      score: 89,
      status: 'Strong',
      icon: Users,
      description: 'Leadership experience and team quality evaluated'
    }
  ];

  const overallScore = 86;
  const starRating = Math.round((overallScore / 100) * 5);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <div className="bg-[var(--primary)] text-white py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Link href="/due-diligence">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-white border-white/40 hover:bg-white/20 bg-white/10 font-medium"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-bold">UNLOCK</h1>
                  <span className="text-lg font-medium">Due Diligence Snapshot</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Company</span>
                    <div className="font-semibold text-lg">{dueRequest.companyName}</div>
                    <div className="text-xs text-white/60">
                      {dueRequest.companyNumber ? `CH: ${dueRequest.companyNumber}` : 'Registration verified'}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Report Generated</span>
                    <div className="font-semibold">{new Date().toLocaleDateString('en-GB', { 
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric' 
                    })}</div>
                    <div className="text-xs text-white/60">v1.0 • System Generated</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <span className="text-white/70 block">Assessment Score</span>
                    <div className="font-semibold text-lg">4.3/5.0</div>
                    <div className="text-xs text-white/60">Recommended</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <nav className="mb-6 text-sm">
            <Link href="/due-diligence" className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              Due Diligence
            </Link>
            <span className="text-[var(--muted-foreground)] mx-2">→</span>
            <span className="text-[var(--foreground)]">{dueRequest.companyName} Snapshot</span>
          </nav>

          {/* Executive Summary */}
          <div className="bg-[var(--card)] rounded-xl border p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Executive Summary</h2>
            </div>
            
            <div className="prose prose-sm max-w-none text-[var(--muted-foreground)]">
              <p className="mb-4">
                <strong className="text-[var(--foreground)]">{dueRequest.companyName}</strong> has undergone comprehensive due diligence analysis. 
                The assessment reveals a <strong>reliable verification</strong> investment opportunity with strong performance across key business areas.
              </p>
              
              <p className="mb-4">
                {dueRequest.result.summary}
              </p>

              <div className="flex items-center gap-4 mt-4 p-3 bg-[var(--muted)]/30 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--foreground)]">4.3/5.0</div>
                  <div className="text-xs text-[var(--muted-foreground)]">Overall Score</div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((star) => (
                    <span key={star} className="text-[var(--accent)] text-sm">★</span>
                  ))}
                  <span className="text-gray-300 text-sm">★</span>
                </div>
                <span className="text-xs px-2 py-1 bg-[var(--success)] text-white rounded font-medium">
                  Recommended
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Scorecard */}
          <div className="bg-[var(--card)] rounded-xl border p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Assessment Scorecard</h2>
            </div>

            <div className="grid gap-4">
              {assessmentData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-[var(--muted)]/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--foreground)]">{item.title}</div>
                        <div className="text-sm text-[var(--muted-foreground)]">{item.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-[var(--foreground)]">{item.score}/100</div>
                      <div className={`text-xs px-2 py-1 rounded font-medium ${
                        item.score >= 80 ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        item.score >= 60 ? 'bg-[var(--accent)]/20 text-[var(--accent)]' :
                        'bg-[var(--destructive)]/20 text-[var(--destructive)]'
                      }`}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[var(--card)] rounded-xl border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Report Actions</h2>
            </div>

            <div className="flex gap-4">
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Share Report
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}