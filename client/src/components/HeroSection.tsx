export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-8">
            <div className="p-3 bg-[#646cff]/10 rounded-xl">
              <i className="fab fa-js-square text-3xl text-[#646cff]"></i>
            </div>
            <div className="p-3 bg-[#41d1ff]/10 rounded-xl">
              <i className="fab fa-react text-3xl text-[#41d1ff]"></i>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <i className="fab fa-js-square text-3xl text-blue-600"></i>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Modern Development
            <span className="bg-gradient-to-r from-[#646cff] to-[#41d1ff] bg-clip-text text-transparent ml-3">Stack</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Built with <span className="font-semibold text-[#646cff]">Vite</span>, 
            <span className="font-semibold text-[#41d1ff]"> React</span>, and 
            <span className="font-semibold text-blue-600"> TypeScript</span>. 
            Fast, type-safe, and developer-friendly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-[#646cff] text-white rounded-lg font-medium hover:bg-[#646cff]/90 transition-colors duration-200 shadow-lg">
              Get Started
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
            <button className="px-8 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-200">
              <i className="fab fa-github mr-2"></i>
              View on GitHub
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
