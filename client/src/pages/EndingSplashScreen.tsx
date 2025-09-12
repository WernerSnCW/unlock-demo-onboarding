import { useEffect, useState } from 'react';
import { Mail, Phone, Globe, ArrowRight } from 'lucide-react';
import unlockLogo from '@assets/unlock-logo.svg';

export default function EndingSplashScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating orbs data
  const floatingOrbs = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    speed: Math.random() * 0.02 + 0.01,
  }));

  return (
    <>
      <style>{`
        .splash-float {
          animation: float 6s ease-in-out infinite;
        }
        .splash-glow {
          box-shadow: 
            0 20px 40px rgba(16, 169, 87, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.3),
            0 0 60px rgba(16, 169, 87, 0.2);
        }
        .splash-shimmer {
          position: relative;
          overflow: hidden;
        }
        .splash-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 169, 87, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 169, 87, 0.8); }
        }
        .contact-card {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--card)] to-[var(--muted)]">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-60 transition-all duration-300"
          style={{
            background: `
              radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, 
                var(--primary) 0%, 
                transparent 50%),
              radial-gradient(circle at ${30 - mousePosition.x * 8}% ${70 - mousePosition.y * 8}%, 
                var(--secondary) 0%, 
                transparent 50%),
              radial-gradient(circle at ${80 + mousePosition.x * 6}% ${20 + mousePosition.y * 6}%, 
                var(--brand-accent-bg) 0%, 
                transparent 50%)
            `,
          }}
        />

        {/* Floating Glass Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingOrbs.map((orb) => (
            <div
              key={orb.id}
              className="absolute rounded-full backdrop-blur-xl border border-white/20"
              style={{
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                left: `${orb.initialX}%`,
                top: `${orb.initialY}%`,
                background: `linear-gradient(135deg, 
                  rgba(16, 169, 87, 0.1) 0%, 
                  rgba(19, 104, 59, 0.05) 100%)`,
                transform: `translate(${mousePosition.x * orb.speed * 20}px, ${mousePosition.y * orb.speed * 20}px)`,
                transition: 'transform 0.3s ease-out',
                boxShadow: `
                  inset 0 1px 0 rgba(255, 255, 255, 0.3),
                  0 10px 30px rgba(0, 0, 0, 0.1)
                `,
              }}
            />
          ))}
        </div>

        {/* Main Content Container */}
        <div 
          className="relative z-10 min-h-screen flex items-center justify-center px-8"
          style={{
            background: `
              radial-gradient(ellipse at center, 
                rgba(255, 255, 255, 0.1) 0%, 
                transparent 70%)
            `,
          }}
        >
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Main Logo */}
            <div 
              className={`mb-8 transform transition-all duration-1000 delay-300 splash-float ${
                isLoaded ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
            >
              <img 
                src={unlockLogo}
                alt="Unlock"
                className="h-20 w-auto mx-auto mb-4"
                style={{
                  filter: `drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))`,
                }}
              />
            </div>

            {/* Thank You Message */}
            <h1 
              className={`text-6xl font-bold mb-6 text-[var(--foreground)] transform transition-all duration-1000 delay-500 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{
                background: `linear-gradient(135deg, 
                  var(--primary) 0%, 
                  var(--secondary) 50%, 
                  var(--brand-accent-bg) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Transform Your Investments?
            </h1>

            {/* Subtitle */}
            <p 
              className={`text-2xl text-[var(--muted-foreground)] mb-12 font-medium transform transition-all duration-1000 delay-700 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              Join thousands of investors making smarter decisions with AI-powered due diligence
            </p>

            {/* Contact Cards */}
            <div 
              className={`grid md:grid-cols-3 gap-6 mb-12 transform transition-all duration-1000 delay-900 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <div className="contact-card p-6 rounded-2xl backdrop-blur-xl border border-white/30 bg-white/10">
                <Mail className="h-8 w-8 mx-auto mb-4 text-[var(--primary)]" />
                <h3 className="font-bold text-[var(--foreground)] mb-2">Get In Touch</h3>
                <p className="text-[var(--muted-foreground)] text-sm">tom@unlockdd.com</p>
              </div>

              <div className="contact-card p-6 rounded-2xl backdrop-blur-xl border border-white/30 bg-white/10">
                <Phone className="h-8 w-8 mx-auto mb-4 text-[var(--secondary)]" />
                <h3 className="font-bold text-[var(--foreground)] mb-2">Book a Demo</h3>
                <p className="text-[var(--muted-foreground)] text-sm">+44 7398 156913</p>
              </div>

              <div className="contact-card p-6 rounded-2xl backdrop-blur-xl border border-white/30 bg-white/10">
                <Globe className="h-8 w-8 mx-auto mb-4 text-[var(--brand-accent-bg)]" />
                <h3 className="font-bold text-[var(--foreground)] mb-2">Learn More</h3>
                <p className="text-[var(--muted-foreground)] text-sm">www.unlockdd.com</p>
              </div>
            </div>

            {/* CTA Button */}
            <div 
              className={`transform transition-all duration-1000 delay-1100 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <button 
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white backdrop-blur-xl border border-white/30 hover:scale-105 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, 
                    var(--primary) 0%, 
                    var(--secondary) 100%)`,
                  boxShadow: `
                    0 20px 40px rgba(16, 169, 87, 0.3),
                    inset 0 2px 0 rgba(255, 255, 255, 0.3)
                  `,
                }}
                data-testid="button-start-free-trial"
              >
                Unlock Your Potential
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Footer Text */}
            <p 
              className={`mt-8 text-[var(--muted-foreground)] text-sm transform transition-all duration-1000 delay-1300 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              Thank you for watching • Unlock Investment Platform • 2025
            </p>

          </div>
        </div>
      </div>
    </>
  );
}