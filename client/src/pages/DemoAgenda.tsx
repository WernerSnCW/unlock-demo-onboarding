import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Play, Users, Target, TrendingUp, Shield, Zap, ArrowRight, Crown, Gift } from 'lucide-react';

export default function DemoAgenda() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full p-4">
                  <Play className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--foreground)] mb-6">
                Investment Due Diligence
                <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto mb-8">
                Experience how our platform transforms complex investment analysis into clear, actionable insights for smarter decisions
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-full text-[var(--muted-foreground)] shadow-sm">
                <Shield className="h-5 w-5 mr-2 text-[var(--success)]" />
                Live Demo Session • 15 minutes
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Section 1: Problem We Solve */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                The Challenge Every Investor Faces
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Investment due diligence shouldn't feel like solving a puzzle in the dark
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
                <div className="bg-[var(--destructive)] bg-opacity-10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <Target className="h-10 w-10 text-[var(--destructive)] mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">Information Overload</h3>
                <p className="text-[var(--muted-foreground)]">Scattered data across multiple sources makes comprehensive analysis time-consuming and error-prone</p>
              </div>
              
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
                <div className="bg-[var(--warning)] bg-opacity-10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-[var(--warning)] mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">Manual Analysis</h3>
                <p className="text-[var(--muted-foreground)]">Hours spent manually cross-referencing financial data, market reports, and company information</p>
              </div>
              
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-8 text-center">
                <div className="bg-[var(--info)] bg-opacity-10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <Users className="h-10 w-10 text-[var(--info)] mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">Fragmented Insights</h3>
                <p className="text-[var(--muted-foreground)]">Difficult to synthesize findings into actionable investment decisions with confidence</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl p-8 text-center text-white">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-3">Our Solution</h3>
              <p className="text-lg opacity-95 max-w-3xl mx-auto">
                Transform weeks of due diligence into minutes with AI-powered analysis, automated data aggregation, and intelligent insights tailored to your investment thesis
              </p>
            </div>
          </section>

          {/* Section 2: Demo Walkthrough */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                See Our Platform in Action
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Discover how we're revolutionizing investment due diligence
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] p-6">
                  <div className="flex items-center text-white">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                      <span className="text-lg font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">AI-Powered Business Analysis</h3>
                      <p className="opacity-90">Upload pitch decks and get instant comprehensive insights</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">What You'll See:</h4>
                      <ul className="space-y-2 text-[var(--muted-foreground)]">
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--primary)] mr-2" />Financial health scoring and trend analysis</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--primary)] mr-2" />Market opportunity assessment</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--primary)] mr-2" />Team evaluation and experience mapping</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--primary)] mr-2" />Risk factor identification</li>
                      </ul>
                    </div>
                    <div className="bg-[var(--muted)] bg-opacity-30 rounded-lg p-6">
                      <div className="text-center">
                        <Link 
                          href="/pitch-deck-analyser" 
                          className="inline-flex items-center px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                          data-testid="link-pitch-deck-analyser"
                        >
                          Try Pitch Deck Analyser
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] p-6">
                  <div className="flex items-center text-white">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-4">
                      <span className="text-lg font-bold text-[var(--foreground)]">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">Portfolio Management & Analytics</h3>
                      <p className="opacity-90 text-[var(--foreground)]">Track your investments with professional-grade tools</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">What You'll Experience:</h4>
                      <ul className="space-y-2 text-[var(--muted-foreground)]">
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--secondary)] mr-2" />Real-time portfolio valuation</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--secondary)] mr-2" />Diversification analysis and recommendations</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--secondary)] mr-2" />Performance benchmarking</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--secondary)] mr-2" />Tax optimization insights</li>
                      </ul>
                    </div>
                    <div className="bg-[var(--muted)] bg-opacity-30 rounded-lg p-6">
                      <div className="text-center">
                        <Link 
                          href="/profile/portfolio" 
                          className="inline-flex items-center px-6 py-3 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                          data-testid="link-portfolio-analytics"
                        >
                          View Portfolio Analytics
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] p-6">
                  <div className="flex items-center">
                    <div className="bg-[var(--foreground)] bg-opacity-20 rounded-full p-2 mr-4">
                      <span className="text-lg font-bold text-[var(--foreground)]">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">Investor Toolkit & Community</h3>
                      <p className="opacity-90 text-[var(--foreground)]">Access professional tools and connect with other investors</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">What You'll Discover:</h4>
                      <ul className="space-y-2 text-[var(--muted-foreground)]">
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--warning)] mr-2" />Tax relief calculators (SEIS, EIS, VCT)</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--warning)] mr-2" />Market intelligence and news curation</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--warning)] mr-2" />Syndicate opportunities</li>
                        <li className="flex items-center"><ArrowRight className="h-4 w-4 text-[var(--warning)] mr-2" />Due diligence collaboration tools</li>
                      </ul>
                    </div>
                    <div className="bg-[var(--muted)] bg-opacity-30 rounded-lg p-6">
                      <div className="text-center">
                        <Link 
                          href="/toolkit" 
                          className="inline-flex items-center px-6 py-3 bg-[var(--warning)] text-[var(--warning-foreground)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                          data-testid="link-investor-toolkit"
                        >
                          Explore Toolkit
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Next Steps */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
                Choose Your Path Forward
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Start your journey with the right plan for your investment goals
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Account */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 text-center relative">
                <div className="bg-[var(--muted)] bg-opacity-30 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <Gift className="h-10 w-10 text-[var(--primary)] mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">Start Free</h3>
                <p className="text-[var(--muted-foreground)] mb-6">
                  Perfect for exploring our platform and getting familiar with investment due diligence tools
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-[var(--muted-foreground)]">
                    <ArrowRight className="h-4 w-4 text-[var(--success)] mr-3 flex-shrink-0" />
                    Access to basic portfolio tracking
                  </li>
                  <li className="flex items-center text-[var(--muted-foreground)]">
                    <ArrowRight className="h-4 w-4 text-[var(--success)] mr-3 flex-shrink-0" />
                    Limited pitch deck analysis (3/month)
                  </li>
                  <li className="flex items-center text-[var(--muted-foreground)]">
                    <ArrowRight className="h-4 w-4 text-[var(--success)] mr-3 flex-shrink-0" />
                    Basic tax calculators
                  </li>
                  <li className="flex items-center text-[var(--muted-foreground)]">
                    <ArrowRight className="h-4 w-4 text-[var(--success)] mr-3 flex-shrink-0" />
                    Community forum access
                  </li>
                </ul>
                <Link 
                  href="/account-settings" 
                  className="block w-full bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  data-testid="button-start-free"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Founding Investor */}
              <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl p-8 text-center relative text-white">
                <div className="absolute top-4 right-4">
                  <div className="bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-1 rounded-full text-sm font-semibold">
                    Limited Time
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <Crown className="h-10 w-10 text-white mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Founding Investor</h3>
                <p className="opacity-90 mb-6">
                  Join our exclusive founding members and shape the future of investment due diligence
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center opacity-95">
                    <ArrowRight className="h-4 w-4 mr-3 flex-shrink-0" />
                    Unlimited access to all features
                  </li>
                  <li className="flex items-center opacity-95">
                    <ArrowRight className="h-4 w-4 mr-3 flex-shrink-0" />
                    Priority customer support
                  </li>
                  <li className="flex items-center opacity-95">
                    <ArrowRight className="h-4 w-4 mr-3 flex-shrink-0" />
                    Exclusive founding member benefits
                  </li>
                  <li className="flex items-center opacity-95">
                    <ArrowRight className="h-4 w-4 mr-3 flex-shrink-0" />
                    Input on roadmap & features
                  </li>
                  <li className="flex items-center opacity-95">
                    <ArrowRight className="h-4 w-4 mr-3 flex-shrink-0" />
                    Locked-in pricing for life
                  </li>
                </ul>
                <button 
                  className="block w-full bg-white text-[var(--primary)] px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-opacity"
                  data-testid="button-founding-investor"
                  onClick={() => window.open('mailto:founders@unlock.com?subject=Founding Investor Interest', '_blank')}
                >
                  Become a Founding Investor
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}