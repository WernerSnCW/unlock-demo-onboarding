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
import InvestorPreferences from "@/pages/InvestorPreferences";
import InvestorPreferencesWizard from "@/pages/InvestorPreferencesWizard";
import SplashScreen from "@/pages/SplashScreen";
import EndingSplashScreen from "@/pages/EndingSplashScreen";
import AssetRegister from "@/pages/AssetRegister";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/asset-register" component={AssetRegister} />
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
      <Route path="/investor-preferences" component={InvestorPreferences} />
      <Route path="/investor-preferences-v2" component={InvestorPreferencesWizard} />
      <Route path="/splash" component={SplashScreen} />
      <Route path="/ending" component={EndingSplashScreen} />
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
