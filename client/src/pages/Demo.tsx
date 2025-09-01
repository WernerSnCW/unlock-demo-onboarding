import { useEffect } from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Play, Sparkles, Shield, ArrowRight, Target, Users, Gift, ChevronRight, Calendar, CheckCircle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center">
          {/* Dynamic Background Mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-transparent to-[var(--secondary)] opacity-8"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[var(--accent)] via-transparent to-[var(--warning)] opacity-5"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            {/* Floating Icon with Glow Effect */}
            <div className="flex items-center justify-center mb-12 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white rounded-full p-8 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-16 w-16" />
                </div>
                <div className="absolute -top-3 -right-3 animate-bounce" style={{animationDelay: '0.5s'}}>
                  <Sparkles className="h-8 w-8 text-[var(--accent)] fill-current" />
                </div>
              </div>
            </div>

            {/* Revolutionary Typography */}
            <h1 className="relative mb-8">
              <span className="block text-2xl md:text-4xl font-light text-[var(--muted-foreground)] tracking-wider uppercase mb-2">Demo Session</span>
              <span className="block text-6xl md:text-8xl font-black bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] bg-clip-text text-transparent leading-none tracking-tight">
                AGENDA
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
            </h1>

            <p className="text-2xl md:text-3xl text-[var(--muted-foreground)] max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Investment Intelligence Platform
              <span className="text-[var(--primary)] font-semibold"> Walkthrough</span>
            </p>

            {/* Status Badge with Animation */}
            <div className="inline-flex items-center px-8 py-4 bg-[var(--card)] border-2 border-[var(--primary)] rounded-full shadow-2xl hover:shadow-[var(--primary)]/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Calendar className="h-6 w-6 text-[var(--primary)]" />
                  <div className="absolute inset-0 animate-ping">
                    <Calendar className="h-6 w-6 text-[var(--primary)] opacity-30" />
                  </div>
                </div>
                <span className="text-[var(--foreground)] font-semibold text-lg">SESSION READY</span>
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Introduction & Framing */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-6">
              INTRODUCTION &
              <span className="block bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                FRAMING
              </span>
            </h2>
          </div>

          {/* Session Expectations */}
          <div className="bg-gradient-to-br from-[var(--warning)] via-[var(--warning)]/20 to-transparent border border-[var(--warning)] rounded-2xl p-8 relative mb-12 max-w-4xl mx-auto">
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-br from-[var(--warning)] to-[var(--accent)] text-white rounded-full p-3 shadow-lg">
                <Lightbulb className="h-6 w-6" />
              </div>
            </div>
            <p className="text-lg text-[var(--foreground)] leading-relaxed font-medium pr-16">
              This demo uses pre-set example portfolios to simulate how Unlock works. After the demo, you can either join the free waitlist or explore our founding investor programme.
            </p>
          </div>

          {/* Demo Session Navigation */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                badge: "01",
                title: "Problem We Solve",
                subtitle: "The Investment Advice Gap",
                description: "Understanding the challenges faced by alternative investors and why traditional advice falls short",
                href: "/advice-gap",
                icon: Target,
                gradient: "from-red-500 to-orange-500",
                bgColor: "bg-red-50 dark:bg-red-950/20",
                borderColor: "border-red-200 dark:border-red-800/30"
              },
              {
                badge: "02", 
                title: "Demo Walkthrough",
                subtitle: "Interactive Platform Tour",
                description: "Hands-on experience with live portfolio analysis, due diligence tools, and investment insights",
                href: "/investor-onboarding",
                icon: Users,
                gradient: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-50 dark:bg-blue-950/20",
                borderColor: "border-blue-200 dark:border-blue-800/30"
              },
              {
                badge: "03",
                title: "Next Steps",
                subtitle: "Your Investment Journey",
                description: "Explore membership options and discover how Unlock can transform your investment process",
                href: "#",
                icon: Gift,
                gradient: "from-green-500 to-emerald-500", 
                bgColor: "bg-green-50 dark:bg-green-950/20",
                borderColor: "border-green-200 dark:border-green-800/30"
              }
            ].map((feature, index) => {
              const CardContent = () => (
                <div className={`relative group ${feature.bgColor} ${feature.borderColor} border rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 ${feature.badge !== "03" ? "cursor-pointer" : ""}`}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-2xl`}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className={`text-lg font-bold px-4 py-2 bg-gradient-to-r ${feature.gradient} text-white border-0`}>
                        {feature.badge}
                      </Badge>
                      <div className={`p-4 bg-gradient-to-br ${feature.gradient} text-white rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <feature.icon className="h-8 w-8" />
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-[var(--foreground)] mb-2 leading-tight">{feature.title}</h3>
                    <p className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-4 tracking-wide">{feature.subtitle}</p>
                    <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">{feature.description}</p>
                    
                    <div className="flex items-center text-[var(--primary)] font-bold group-hover:translate-x-2 transition-transform duration-300">
                      <span className="mr-2">{feature.badge === "03" ? "View Options" : "Explore Section"}</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
              
              // Wrap in Link for cards 01 and 02, return plain div for card 03
              return feature.badge === "03" ? (
                <div key={index}><CardContent /></div>
              ) : (
                <Link key={index} href={feature.href}>
                  <CardContent />
                </Link>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-block relative mb-8">
              <h3 className="text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight">
                READY TO BEGIN?
              </h3>
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] opacity-10 blur-xl rounded-full"></div>
            </div>
            
            <Link href="/advice-gap" className="group">
              <div className="inline-block relative bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-[var(--primary)]/30 transition-all duration-300 group-hover:scale-105">
                <div className="flex items-center gap-4">
                  <Play className="h-7 w-7" />
                  <span>start demo</span>
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