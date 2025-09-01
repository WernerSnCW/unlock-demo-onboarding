import { useEffect } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, ArrowRight, Play, Users, Target, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Demo() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
            Demo Session Agenda
          </h1>
          <p className="text-xl text-[var(--muted-foreground)]">
            Investment Intelligence Platform Walkthrough
          </p>
        </div>

        {/* Introduction & Framing */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center">
              <Play className="h-6 w-6 mr-3 text-[var(--primary)]" />
              Introduction & Framing
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                  Begin with a session agenda slide:
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-[var(--foreground)]">Problem we solve</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-[var(--foreground)]">Demo walkthrough tailored to investor interests</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-[var(--foreground)]">Next steps (free account vs. founding investor)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[var(--muted)] rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                  Establish expectations:
                </h3>
                <p className="text-[var(--foreground)] leading-relaxed">
                  "This demo uses pre-set example portfolios to simulate how Unlock works. After the demo, you can either join the free waitlist or explore our founding investor programme."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Flow Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/advice-gap">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 dark:bg-red-900/50 rounded-full p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">01. Problem We Solve</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Understanding the investment advice gap
                </p>
                <div className="flex items-center justify-center mt-4 text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium mr-2">Explore</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investor-onboarding">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3 w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">02. Demo Walkthrough</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Interactive platform demonstration
                </p>
                <div className="flex items-center justify-center mt-4 text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium mr-2">Start Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-dashed border-2 border-[var(--border)]">
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3 w-fit mx-auto mb-4">
                <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">03. Next Steps</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Free waitlist or founding investor options
              </p>
              <div className="flex items-center justify-center mt-4 text-[var(--muted-foreground)]">
                <span className="text-sm font-medium">After Demo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Ready to Begin?
          </h3>
          <p className="text-[var(--muted-foreground)] mb-8">
            Start with understanding the problem we're solving for investors
          </p>
          
          <Link href="/advice-gap" className="group">
            <div className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className="flex items-center gap-3">
                <Play className="h-6 w-6" />
                <span>Begin Demo Session</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}