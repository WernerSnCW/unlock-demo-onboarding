import Header from '../components/Header';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                About <span className="bg-gradient-to-r from-[#646cff] to-[#41d1ff] bg-clip-text text-transparent">DevStack</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                A comprehensive development environment designed to accelerate modern web application development.
              </p>
            </div>
          </div>
        </section>
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
