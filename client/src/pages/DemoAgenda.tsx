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

        {/* Main Content - Simple Agenda */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-6">
              Demo Session Agenda
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8">
              Here's what we'll cover in today's live demonstration
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-full text-[var(--muted-foreground)] shadow-sm">
              <Shield className="h-4 w-4 mr-2 text-[var(--success)]" />
              Estimated Duration: 15 minutes
            </div>
          </div>
          
          {/* Agenda Items */}
          <div className="space-y-6">
            {/* Agenda Item 1 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-3 w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">Problem we solve</h3>
                  <p className="text-[var(--muted-foreground)] text-lg">Understanding the investment due diligence challenge</p>
                </div>
              </div>
            </div>

            {/* Agenda Item 2 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-[var(--secondary)] to-[var(--accent)] text-white rounded-full p-3 w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold text-[var(--foreground)]">2</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">Demo walkthrough tailored to investor interests</h3>
                  <p className="text-[var(--muted-foreground)] text-lg">Live demonstration of our platform's key features</p>
                </div>
              </div>
            </div>

            {/* Agenda Item 3 */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--warning)] text-[var(--foreground)] rounded-full p-3 w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">Next steps</h3>
                  <p className="text-[var(--muted-foreground)] text-lg">Free account vs. founding investor opportunities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-lg opacity-95 mb-6 max-w-2xl mx-auto">
                Let's dive into the demonstration and see how our platform can transform your investment process
              </p>
              <Link 
                href="/"
                className="inline-flex items-center px-8 py-3 bg-white text-[var(--primary)] rounded-lg font-semibold hover:bg-opacity-90 transition-opacity shadow-lg"
                data-testid="button-start-demo"
              >
                <Play className="h-5 w-5 mr-2" />
                Begin Demo
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}