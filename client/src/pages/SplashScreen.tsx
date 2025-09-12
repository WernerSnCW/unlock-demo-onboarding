import { useEffect, useState } from 'react';
import unlockLogo from '@assets/unlock-logo.svg';

export default function SplashScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--background)]">
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            var(--primary) 0%, 
            var(--secondary) 25%, 
            var(--accent) 50%, 
            transparent 70%)`
        }}
      />
      
      {/* Floating Glass Orbs */}
      <div className="absolute inset-0">
        {/* Large Primary Orb */}
        <div 
          className={`absolute top-20 left-20 w-64 h-64 rounded-full transition-all duration-1000 ${
            isLoaded ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
          }}
        />
        
        {/* Secondary Orb */}
        <div 
          className={`absolute top-40 right-32 w-48 h-48 rounded-full transition-all duration-1000 ${
            isLoaded ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, var(--secondary) 0%, transparent 70%)`,
            filter: 'blur(30px)',
            animationDelay: '0.5s',
            transform: `translate(${mousePosition.x * -0.08}px, ${mousePosition.y * 0.08}px)`,
          }}
        />
        
        {/* Brand Accent Orb */}
        <div 
          className={`absolute bottom-32 left-1/3 w-56 h-56 rounded-full transition-all duration-1000 ${
            isLoaded ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, var(--brand-accent-bg) 0%, transparent 70%)`,
            filter: 'blur(35px)',
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * 0.06}px, ${mousePosition.y * -0.06}px)`,
          }}
        />
        
        {/* Small Accent Orbs */}
        <div 
          className={`absolute top-32 right-20 w-32 h-32 rounded-full transition-all duration-1000 ${
            isLoaded ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, var(--success) 0%, transparent 70%)`,
            filter: 'blur(20px)',
            animationDelay: '1.5s',
            transform: `translate(${mousePosition.x * -0.05}px, ${mousePosition.y * 0.05}px)`,
          }}
        />
        
        <div 
          className={`absolute bottom-20 right-40 w-40 h-40 rounded-full transition-all duration-1000 ${
            isLoaded ? 'animate-pulse' : ''
          }`}
          style={{
            background: `radial-gradient(circle, var(--warning) 0%, transparent 70%)`,
            filter: 'blur(25px)',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * 0.04}px, ${mousePosition.y * -0.04}px)`,
          }}
        />
      </div>

      {/* Glassmorphism Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full transition-all duration-1000 ${
              isLoaded ? 'animate-bounce' : ''
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'var(--primary)',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.3,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className={`text-center transform transition-all duration-1000 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Glassmorphism Main Card */}
          <div 
            className="relative p-12 rounded-3xl backdrop-blur-3xl border border-white/20 shadow-2xl max-w-4xl mx-auto"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%)`,
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `,
            }}
          >
            
            {/* Brand Logo/Icon Area */}
            <div 
              className={`mb-8 transform transition-all duration-1000 delay-300 splash-float ${
                isLoaded ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
            >
              <div 
                className="w-24 h-24 mx-auto rounded-2xl backdrop-blur-xl border border-white/30 flex items-center justify-center splash-glow"
                style={{
                  background: `linear-gradient(135deg, 
                    var(--primary) 0%, 
                    var(--secondary) 100%)`,
                }}
              >
                <img 
                  src={unlockLogo}
                  alt="Unlock"
                  className="w-12 h-12 brightness-0 invert"
                />
              </div>
            </div>

            {/* Main Title */}
            <h1 
              className={`text-8xl font-bold mb-6 text-[var(--foreground)] transform transition-all duration-1000 delay-500 ${
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
              UNLOCK
            </h1>

            {/* Subtitle */}
            <p 
              className={`text-2xl text-[var(--muted-foreground)] mb-8 font-medium transform transition-all duration-1000 delay-700 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              Investment Due Diligence Platform
            </p>

            {/* Feature Pills */}
            <div 
              className={`flex flex-wrap justify-center gap-4 mb-10 transform transition-all duration-1000 delay-900 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              {[
                'AI-Powered Analysis',
                'Community Intelligence',
                'Syndication Marketplace',
                'Professional Toolkit'
              ].map((feature, index) => (
                <div
                  key={feature}
                  className="px-6 py-3 rounded-full backdrop-blur-xl border border-white/30 text-[var(--foreground)]"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.15) 0%, 
                      rgba(255, 255, 255, 0.05) 100%)`,
                    boxShadow: `
                      0 8px 25px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    animationDelay: `${1 + index * 0.1}s`,
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>

            {/* Loading Indicator */}
            <div 
              className={`transform transition-all duration-1000 delay-1100 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              <div className="w-64 h-2 mx-auto rounded-full bg-white/20 overflow-hidden splash-shimmer">
                <div 
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, 
                      var(--primary) 0%, 
                      var(--secondary) 50%, 
                      var(--brand-accent-bg) 100%)`,
                    width: '100%',
                  }}
                />
              </div>
              <p className="text-[var(--muted-foreground)] mt-4 text-lg">
                Initializing Platform...
              </p>
            </div>
          </div>

          {/* Floating Secondary Cards */}
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-2xl backdrop-blur-xl border border-white/20 opacity-60"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%)`,
              transform: `rotate(-12deg) translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          />
          
          <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-2xl backdrop-blur-xl border border-white/20 opacity-60"
            style={{
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%)`,
              transform: `rotate(15deg) translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
            }}
          />
        </div>
      </div>

      {/* Custom animations handled inline */}
    </div>
  );
}