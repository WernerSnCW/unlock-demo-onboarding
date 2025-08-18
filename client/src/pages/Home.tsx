import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}
