import { Link } from 'wouter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import TechnicalSpecs from '../components/TechnicalSpecs';

export default function DemoAgenda() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <TechnicalSpecs />
      </main>
      <Footer />
    </div>
  );
}