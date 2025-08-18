import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Syndication() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
              Syndication
            </h1>
            <p className="text-[var(--muted-foreground)] mb-8">
              Coming soon - Connect with other investors and syndicates
            </p>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-8">
              <p className="text-[var(--muted-foreground)]">
                This page will contain syndication and investor networking features.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}