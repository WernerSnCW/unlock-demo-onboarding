import { useEffect } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Play, Sparkles, TrendingUp, Shield, Eye, Users, Zap, ArrowRight, CheckCircle, Target, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Demo() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-64 right-24 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-[var(--warning)] rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-48 left-24 w-28 h-28 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
      </div>

      <Header />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden min-h-[80vh] flex items-center justify-center">
          {/* Dynamic Background Mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Floating Icon with Glow Effect */}
            <div className="flex items-center justify-center mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-12 w-12" />
                </div>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-6 w-6 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            {/* Revolutionary Typography */}
            <h1 className="relative mb-8">
              <span className="block text-2xl md:text-4xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-2">Investment Intelligence</span>
              <span className="block text-5xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                UNLEASHED
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Experience how
              <span className="text-[var(--primary)] font-semibold"> Unlock transforms investment decision-making</span>
            </p>

            {/* Interactive Demo Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3 w-fit mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">Live Portfolio Analysis</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Real-time market data and AI-powered insights</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border-green-200/50 dark:border-green-800/30 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3 w-fit mx-auto mb-4">
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">Due Diligence</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Comprehensive business intelligence reports</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20 border-purple-200/50 dark:border-purple-800/30 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-3 w-fit mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">Investment Syndication</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Connect with fellow investors and opportunities</p>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/investor-onboarding" className="group">
                <div className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6" />
                    <span>Start Interactive Demo</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              
              <Link href="/demo/agenda" className="group">
                <div className="inline-block relative border-2 border-[var(--primary)] text-[var(--primary)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--primary)] hover:text-white transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6" />
                    <span>View Demo Agenda</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Platform Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4">
              UNLOCK YOUR
              <span className="block bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent">
                INVESTMENT POTENTIAL
              </span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
              Comprehensive investment intelligence platform designed for modern investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building,
                title: "Business Due Diligence",
                description: "In-depth analysis of investment opportunities with real-time data and AI insights",
                color: "text-blue-600"
              },
              {
                icon: TrendingUp,
                title: "Portfolio Analytics",
                description: "Track performance, analyze trends, and optimize your investment strategy",
                color: "text-green-600"
              },
              {
                icon: Users,
                title: "Syndicate Discovery",
                description: "Connect with investment opportunities and fellow investors in your network",
                color: "text-purple-600"
              },
              {
                icon: Shield,
                title: "Risk Assessment",
                description: "Advanced risk modeling and scenario analysis for informed decision-making",
                color: "text-orange-600"
              },
              {
                icon: Zap,
                title: "Real-time Insights",
                description: "Live market data, news analysis, and intelligent alerts for your portfolio",
                color: "text-cyan-600"
              },
              {
                icon: Target,
                title: "Investment Tools",
                description: "Comprehensive toolkit including pitch deck analyzer and valuation models",
                color: "text-red-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-[var(--card)] border-[var(--border)] hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{feature.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ready to Start Section */}
        <div className="bg-gradient-to-br from-[var(--muted)] to-[var(--card)] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-6">
              Ready to Transform Your Investment Process?
            </h3>
            <p className="text-xl text-[var(--muted-foreground)] mb-8">
              Experience the power of intelligent investment analysis with our interactive demo
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              {[
                "Upload Portfolio Data",
                "AI-Powered Analysis", 
                "Real-time Insights",
                "Investment Recommendations"
              ].map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[var(--success)]" />
                    <span className="text-sm font-medium text-[var(--foreground)]">{step}</span>
                  </div>
                  {index < 3 && <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] mx-3" />}
                </div>
              ))}
            </div>

            <Link href="/investor-onboarding" className="group">
              <div className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center gap-3">
                  <Play className="h-7 w-7" />
                  <span>Begin Your Demo Journey</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}