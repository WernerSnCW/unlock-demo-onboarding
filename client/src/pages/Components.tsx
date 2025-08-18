import Header from '../components/Header';
import ComponentShowcase from '../components/ComponentShowcase';
import Footer from '../components/Footer';

export default function Components() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                Component <span className="bg-gradient-to-r from-[#646cff] to-[#41d1ff] bg-clip-text text-transparent">Library</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                Explore our collection of pre-built, accessible components ready for production use.
              </p>
            </div>
          </div>
        </section>
        <ComponentShowcase />
      </main>
      <Footer />
    </div>
  );
}
