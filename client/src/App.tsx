import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { InvestorProvider } from "./contexts/InvestorContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Businesses from "@/pages/Businesses";
import BusinessProfile from "@/pages/BusinessProfile";
import SnapshotReport from "@/pages/SnapshotReport";
import Toolkit from "@/pages/Toolkit";
import Syndication from "@/pages/Syndication";
import SyndicateDetail from "./pages/SyndicateDetail";
import SyndicationBundles from "./pages/SyndicationBundles";
import NewsEnhanced from "@/pages/NewsEnhanced";
import PitchDeckAnalyserPage from "@/pages/PitchDeckAnalyser";
import DueDiligenceHub from "@/pages/DueDiligenceHub";
import DueDiligenceRequests from "@/pages/DueDiligenceRequests";
import DueDiligenceRequestDetail from "@/pages/DueDiligenceRequestDetail";
import Profile from "@/pages/Profile";
import ProfilePortfolio from "@/pages/ProfilePortfolio";
import AccountSettings from "@/pages/AccountSettings";
import Demo from "@/pages/Demo";
import DemoSimulation from "@/pages/DemoSimulation";
import DemoAgenda from "@/pages/DemoAgenda";
import AdviceGap from "@/pages/AdviceGap";
import InvestorOnboarding from "@/pages/InvestorOnboarding";
import PortfolioAnalysis from "@/pages/PortfolioAnalysis";
import DemoPortfolioAnalysis from "@/pages/DemoPortfolioAnalysis";
import SplashScreen from "@/pages/SplashScreen";
import EndingSplashScreen from "@/pages/EndingSplashScreen";
import AssetRegister from "@/pages/AssetRegister";
import TargetsAndBands from "@/pages/TargetsAndBands";

const OnboardingV2Welcome = lazy(() => import("@/pages/onboarding-v2/Welcome"));
const OnboardingV2Method = lazy(() => import("@/pages/onboarding-v2/Method"));
const OnboardingV2Intake = lazy(() => import("@/pages/onboarding-v2/Intake"));
const OnboardingV2Holdings = lazy(() => import("@/pages/onboarding-v2/Holdings"));
const OnboardingV2Beliefs = lazy(() => import("@/pages/onboarding-v2/Beliefs"));
const OnboardingV2Analysis = lazy(() => import("@/pages/onboarding-v2/Analysis"));
const OnboardingV2Target = lazy(() => import("@/pages/onboarding-v2/Target"));
const OnboardingV2NextSteps = lazy(() => import("@/pages/onboarding-v2/NextSteps"));
const OnboardingV2PlanTransition = lazy(() => import("@/pages/onboarding-v2/PlanTransition"));
const OnboardingV2PlanWrappers = lazy(() => import("@/pages/onboarding-v2/PlanWrappers"));
const OnboardingV2Report = lazy(() => import("@/pages/onboarding-v2/Report"));
const OnboardingV2ScenarioPlanner = lazy(() => import("@/pages/onboarding-v2/ScenarioPlanner"));


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/asset-register" component={AssetRegister} />
      <Route path="/targets-bands" component={TargetsAndBands} />
      <Route path="/businesses" component={Businesses} />
      <Route path="/business/:id" component={BusinessProfile} />
      <Route path="/snapshot/:id" component={SnapshotReport} />
      <Route path="/toolkit" component={Toolkit} />
      <Route path="/pitch-deck-analyser" component={PitchDeckAnalyserPage} />
      <Route path="/syndication" component={Syndication} />
      <Route path="/syndication/bundles" component={SyndicationBundles} />
      <Route path="/syndication/:id" component={SyndicateDetail} />
      <Route path="/news" component={NewsEnhanced} />
      <Route path="/due-diligence" component={DueDiligenceHub} />
      <Route path="/due-diligence/requests" component={DueDiligenceRequests} />
      <Route path="/due-diligence/requests/:id" component={DueDiligenceRequestDetail} />
      <Route path="/due-diligence/snapshot/:id" component={SnapshotReport} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/portfolio" component={ProfilePortfolio} />
      <Route path="/account-settings" component={AccountSettings} />
      <Route path="/demo" component={Demo} />
      <Route path="/demo-simulation" component={DemoSimulation} />
      <Route path="/demo/agenda" component={DemoAgenda} />
      <Route path="/advice-gap" component={AdviceGap} />
      <Route path="/investor-onboarding" component={InvestorOnboarding} />
      <Route path="/portfolio-analysis" component={PortfolioAnalysis} />
      <Route path="/demo-portfolio-analysis" component={DemoPortfolioAnalysis} />
      <Route path="/splash" component={SplashScreen} />
      <Route path="/ending" component={EndingSplashScreen} />
      
      {/* Onboarding v2 Routes (lazy-loaded) */}
      <Route path="/onboarding-v2/welcome">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Welcome /></Suspense>}</Route>
      <Route path="/onboarding-v2/method">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Method /></Suspense>}</Route>
      <Route path="/onboarding-v2/intake">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Intake /></Suspense>}</Route>
      <Route path="/onboarding-v2/holdings">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Holdings /></Suspense>}</Route>
      <Route path="/onboarding-v2/beliefs">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Beliefs /></Suspense>}</Route>
      <Route path="/onboarding-v2/analysis">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Analysis /></Suspense>}</Route>
      <Route path="/onboarding-v2/target">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Target /></Suspense>}</Route>
      <Route path="/onboarding-v2/next-steps">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2NextSteps /></Suspense>}</Route>
      <Route path="/onboarding-v2/plan/transition">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2PlanTransition /></Suspense>}</Route>
      <Route path="/onboarding-v2/plan/wrappers">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2PlanWrappers /></Suspense>}</Route>
      <Route path="/onboarding-v2/report">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2Report /></Suspense>}</Route>
      <Route path="/onboarding-v2/scenario-planner">{() => <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" /></div>}><OnboardingV2ScenarioPlanner /></Suspense>}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <InvestorProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </InvestorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
