import { Link, useLocation } from 'wouter';
import {
  LineChart, ShieldCheck, Layers, Crosshair, Landmark, Users, Cpu, Scale,
  ArrowRight, History,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { ArcButton } from '@/components/ui/unlock/ArcButton';
import { startNewInvestor } from '@/lib/onboardingSync';
import unlockLogo from '@assets/unlock-logo.svg';

interface Feature {
  icon: typeof LineChart;
  title: string;
  blurb: string;
  status: 'live' | 'roadmap';
}

// Mapped from the Unlock content pillars (decision-support platform for HNW
// investors, outside the FCA perimeter by design).
const FEATURES: Feature[] = [
  {
    icon: LineChart,
    title: 'Portfolio Onboarding & Persona',
    blurb: 'Capture an investor’s holdings and surface an explainable investor persona in minutes.',
    status: 'live',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Lights',
    blurb: 'Liquidity, concentration and illiquidity checks flag the risks worth addressing first.',
    status: 'live',
  },
  {
    icon: LineChart,
    title: 'Scenario Planner',
    blurb: 'Replay how a portfolio like theirs behaved through real historical periods of stress.',
    status: 'live',
  },
  {
    icon: Layers,
    title: 'Alternatives Architecture',
    blurb: 'Alternatives without architecture: surface and model what conventional platforms can’t see.',
    status: 'roadmap',
  },
  {
    icon: Crosshair,
    title: 'Concentration Risk',
    blurb: 'The single-position problem — diversifying out of a large holding without losing its protection.',
    status: 'roadmap',
  },
  {
    icon: Landmark,
    title: 'Tax Architecture',
    blurb: 'Wrapper sequencing and the Finance Act 2026 estate changes — where the interactions live.',
    status: 'roadmap',
  },
  {
    icon: Users,
    title: 'Generational Transfer',
    blurb: 'Household-level reasoning: gifting, succession, education funding and business transfer.',
    status: 'roadmap',
  },
  {
    icon: Cpu,
    title: 'AI-Native Modelling',
    blurb: 'Institutional-grade modelling at a subscription price, built on an AI-native reasoning layer.',
    status: 'roadmap',
  },
];

export default function Start() {
  const [, navigate] = useLocation();

  const onStart = () => {
    // Begin a fresh investor each time the demo is launched from here.
    startNewInvestor();
    navigate('/onboarding-v2/welcome');
  };

  return (
    <div className="relative min-h-screen bg-[var(--background)] overflow-hidden flex flex-col">
      {/* Faint light-grid background (launch screen only), masked to fade at the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 18%, #000 55%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 18%, #000 55%, transparent 100%)',
        }}
        aria-hidden
      />

      {/* Ambient brand glow */}
      <div className="relative z-10 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,187,119,0.25), transparent 70%)' }}
        />

        <header className="relative max-w-6xl mx-auto w-full px-6 pt-10 flex items-center justify-between">
          <img src={unlockLogo} alt="Unlock" className="h-8 w-auto brightness-0 invert" />
          <Link
            href="/onboarding-v2/resume"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
            data-testid="link-resume-start"
          >
            <History className="w-4 h-4" />
            Resume a saved investor
          </Link>
        </header>

        {/* Hero */}
        <section className="relative max-w-3xl mx-auto w-full px-6 pt-16 pb-12 text-center">
          <p className="u-eyebrow mb-4">Decision support for private wealth</p>
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-[var(--foreground)] leading-[1.05] mb-6">
            Institutional-grade clarity,{' '}
            <span className="u-grad-green">at a subscription price.</span>
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
            Unlock is a decision-support platform for HNW investors — the £500k–£25M cohort
            underserved between mass-affluent apps and family offices. Structured analysis around
            the decisions you already make alone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ArcButton variant="primary" onClick={onStart} data-testid="button-start-onboarding">
              Start Onboarding
              <ArrowRight className="w-4 h-4" />
            </ArcButton>
            <Link
              href="/onboarding-v2/resume"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              or continue a saved session
            </Link>
          </div>
        </section>
      </div>

      {/* Feature grid */}
      <section className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-16">
        <div className="u-divider mb-10 max-w-xs mx-auto" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="u-hover-lift relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5"
                data-testid={`feature-${f.title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#008655] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[var(--primary-foreground)]" />
                  </div>
                  <span
                    className={
                      f.status === 'live'
                        ? 'text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-[#00bb77]/12 text-[var(--primary)] border border-[#00bb77]/30'
                        : 'text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-[#ffffff]/[0.04] text-[var(--muted-foreground)] border border-[var(--border)]'
                    }
                  >
                    {f.status === 'live' ? 'In this demo' : 'Roadmap'}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1.5">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{f.blurb}</p>
              </div>
            );
          })}
        </div>

        {/* Positioning strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-2">
            <Scale className="w-4 h-4 text-[var(--primary)]" />
            Conflict-free: the platform doesn’t earn from your decisions
          </span>
          <span className="inline-flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--primary)]" />
            AI-native reasoning layer
          </span>
        </div>

        {/* Mandatory compliance line (LOCKED) */}
        <p className="mt-10 text-center text-xs leading-relaxed text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Unlock operates outside the FCA perimeter by design — what we provide is structured
          decision support, not regulated financial advice. Capital is at risk; the value of
          investments can fall as well as rise and investors may not get back the full amount invested.
        </p>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
