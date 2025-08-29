import { useEffect } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AlertTriangle, Clock, Shield, TrendingDown, Search, AlertCircle, Target, Eye, ChevronRight, Zap, Users, ArrowRight } from 'lucide-react';

export default function AdviceGap() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--destructive)] to-[var(--warning)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--warning)] to-[var(--accent)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--accent)] to-[var(--destructive)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
          {/* Dynamic Background Mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--destructive)] via-transparent to-[var(--warning)] opacity-8"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--warning)] via-transparent to-[var(--accent)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Warning Icon with Dramatic Effect */}
            <div className="flex items-center justify-center mb-12 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--destructive)] to-[var(--warning)] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-[var(--destructive)] to-[var(--warning)] text-white rounded-full p-8 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-16 w-16" />
                </div>
                <div className="absolute -top-3 -right-3 animate-bounce" style={{animationDelay: '0.5s'}}>
                  <AlertCircle className="h-8 w-8 text-[var(--warning)] fill-current" />
                </div>
              </div>
            </div>

            {/* Dramatic Typography */}
            <h1 className="relative mb-8">
              <span className="block text-6xl md:text-8xl font-black text-[var(--destructive)] leading-none tracking-tight mb-4">
                THE ADVICE
              </span>
              <span className="block text-6xl md:text-8xl font-black bg-gradient-to-r from-[var(--warning)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                GAP
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-[var(--destructive)] to-transparent"></div>
            </h1>

            <p className="text-2xl md:text-3xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              The advice gap leaves investors 
              <span className="text-[var(--destructive)] font-semibold"> flying blind</span>
            </p>

            {/* Status Indicator */}
            <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--destructive)] rounded-full shadow-2xl hover:shadow-[var(--destructive)]/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Eye className="h-6 w-6 text-[var(--destructive)]" />
                  <div className="absolute inset-0 animate-ping">
                    <Eye className="h-6 w-6 text-[var(--destructive)] opacity-30" />
                  </div>
                </div>
                <span className="text-[var(--foreground)] font-semibold text-lg">REALITY CHECK</span>
                <div className="w-2 h-2 bg-[var(--destructive)] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* The Reality Section */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6">
              THE REALITY FOR 
              <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                ALTERNATIVE INVESTORS
              </span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] max-w-5xl mx-auto leading-relaxed mb-8">
              Across alternatives—startups, art, whisky, private deals—most IFAs don't provide advice, so investors end up piecing 
              things together themselves. Information is fragmented, valuations don't always align, and due diligence takes too long.
            </p>
            <div className="bg-[var(--warning)] bg-opacity-20 border border-[var(--warning)] rounded-2xl p-6 max-w-4xl mx-auto">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                <strong>The result:</strong> slower decisions, portfolios that become too concentrated, and missed EIS/SEIS tax relief opportunities.
              </p>
            </div>
          </div>

          {/* Three Main Problems */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            
            {/* Problem 1: Difficulty Accessing Accurate Valuations */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--destructive)] to-[var(--warning)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--destructive)] rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--destructive)] to-[var(--warning)]"></div>
                
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-[var(--destructive)] to-[var(--warning)] rounded-2xl p-4 shadow-xl group-hover:scale-110 transition-transform">
                      <Search className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-[var(--destructive)] to-[var(--warning)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 text-center">
                  VALUATION CHAOS
                </h3>
                
                <p className="text-[var(--muted-foreground)] text-center mb-6 leading-relaxed">
                  Difficulty accessing accurate valuations across asset classes
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--destructive)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Property: Rightmove vs Zoopla vs agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--destructive)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Art: Gallery vs auction house</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--destructive)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Startups: Platform vs founder claims</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2: Lack of Time and Tools */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--warning)] to-[var(--accent)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--warning)] rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)]"></div>
                
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-[var(--warning)] to-[var(--accent)] rounded-2xl p-4 shadow-xl group-hover:scale-110 transition-transform">
                      <Clock className="h-12 w-12 text-[var(--accent-foreground)]" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-[var(--warning)] to-[var(--accent)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 text-center">
                  TIME DEFICIT
                </h3>
                
                <p className="text-[var(--muted-foreground)] text-center mb-6 leading-relaxed">
                  Lack of time and tools to evaluate opportunities properly
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--warning)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Relying on multiple advisors for different asset classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--warning)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Sourcing opportunities from platforms, networks, and direct contacts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--warning)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Struggling to get guidance on alternatives</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3: Risk of Bias and Overexposure */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
              <div className="relative bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--accent)] rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)]"></div>
                
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-2xl p-4 shadow-xl group-hover:scale-110 transition-transform">
                      <TrendingDown className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 text-center">
                  PORTFOLIO DRIFT
                </h3>
                
                <p className="text-[var(--muted-foreground)] text-center mb-6 leading-relaxed">
                  Risk of bias, scams, or overexposure in portfolios
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Too much property exposure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Geographic concentration risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>
                    <span className="text-[var(--muted-foreground)]">Liquidity imbalances</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sound Familiar Section */}
          <div className="bg-gradient-to-r from-[var(--card)] to-[var(--muted)] bg-opacity-50 rounded-3xl p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6">
                SOUND FAMILIAR?
              </h2>
              <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
                These are common challenges we hear from investors
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Investment Sourcing */}
              <div>
                <h3 className="text-2xl font-bold text-[var(--primary)] mb-6 flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Investment Sourcing:
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Relying on multiple advisors for different asset classes</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Sourcing opportunities from platforms, networks, and direct contacts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Struggling to get guidance on alternatives</span>
                  </div>
                </div>
              </div>

              {/* Common Pain Points */}
              <div>
                <h3 className="text-2xl font-bold text-[var(--secondary)] mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6" />
                  Common Pain Points:
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--secondary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Uncertainty about valuation accuracy across assets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--secondary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Conflicting valuations between different sources</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--secondary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Portfolios becoming concentrated in one area</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-5 w-5 text-[var(--secondary)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)]">Missing EIS/SEIS deadlines or opportunities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] rounded-3xl p-12 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                    READY FOR THE SOLUTION?
                  </h3>
                  <p className="text-xl md:text-2xl opacity-95 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                    See how Unlock transforms these challenges into competitive advantages
                  </p>
                  <Link 
                    href="/demo"
                    className="group inline-flex items-center px-12 py-6 bg-white text-[var(--primary)] rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/20"
                    data-testid="button-see-solution"
                  >
                    <Zap className="h-8 w-8 mr-4 group-hover:scale-110 transition-transform" />
                    SEE THE SOLUTION
                    <ArrowRight className="h-8 w-8 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}