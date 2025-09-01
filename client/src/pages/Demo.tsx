import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComponentShowcase from '../components/ComponentShowcase';
import TechnicalSpecs from '../components/TechnicalSpecs';
import { ArrowRight, Github } from 'lucide-react';

export default function Demo() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#646cff]/5 via-transparent to-[#41d1ff]/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo Section */}
          <div className="flex items-center justify-center space-x-8 mb-12">
            {/* Vite Logo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#646cff] to-[#747bff] rounded-full flex items-center justify-center mb-3 transform hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
              <span className="text-sm font-medium text-slate-600">Vite</span>
            </div>
            
            {/* Plus Icon */}
            <div className="text-3xl text-slate-400 font-light">+</div>
            
            {/* React Logo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#41d1ff] to-[#61dafb] rounded-full flex items-center justify-center mb-3 transform hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">⚛</span>
              </div>
              <span className="text-sm font-medium text-slate-600">React</span>
            </div>
            
            {/* Plus Icon */}
            <div className="text-3xl text-slate-400 font-light">+</div>
            
            {/* TypeScript Logo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-3 transform hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">TS</span>
              </div>
              <span className="text-sm font-medium text-slate-600">TypeScript</span>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Modern Development
            <span className="block bg-gradient-to-r from-[#646cff] to-[#41d1ff] bg-clip-text text-transparent">
              Stack
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Experience lightning-fast development with Vite, powerful React components, 
            and rock-solid TypeScript integration. Built for modern web development.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#646cff] to-[#747bff] text-white font-semibold rounded-xl hover:from-[#646cff]/90 hover:to-[#747bff]/90 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <span className="mr-2">Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="inline-flex items-center px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 group">
              <Github className="h-5 w-5 mr-2" />
              <span>View on GitHub</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* Component Showcase */}
      <ComponentShowcase />
      
      {/* Technical Specifications */}
      <TechnicalSpecs />
      
      <Footer />
    </div>
  );
}