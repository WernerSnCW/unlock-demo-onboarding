import Header from '../components/Header';
import TechnicalSpecs from '../components/TechnicalSpecs';
import Footer from '../components/Footer';

export default function Docs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                <span className="bg-gradient-to-r from-[#646cff] to-[#41d1ff] bg-clip-text text-transparent">Documentation</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                Everything you need to get started with our modern development stack.
              </p>
            </div>
          </div>
        </section>
        <TechnicalSpecs />
        
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-slate-50 rounded-xl p-6">
                  <i className="fas fa-rocket text-2xl text-[#646cff] mb-4"></i>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Getting Started</h3>
                  <p className="text-slate-600 text-sm">Learn how to set up your development environment and create your first project.</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-6">
                  <i className="fas fa-puzzle-piece text-2xl text-[#41d1ff] mb-4"></i>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Components</h3>
                  <p className="text-slate-600 text-sm">Detailed documentation for all available components and their usage patterns.</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-6">
                  <i className="fas fa-cog text-2xl text-[#10b981] mb-4"></i>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Configuration</h3>
                  <p className="text-slate-600 text-sm">Advanced configuration options for customizing your development stack.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
