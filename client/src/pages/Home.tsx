import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ComponentShowcase from '../components/ComponentShowcase';
import TechnicalSpecs from '../components/TechnicalSpecs';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ComponentShowcase />
        <TechnicalSpecs />
      </main>
      <Footer />
    </div>
  );
}
