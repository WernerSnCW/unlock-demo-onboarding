import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Businesses from "@/pages/Businesses";
import Toolkit from "@/pages/Toolkit";
import Syndication from "@/pages/Syndication";
import News from "@/pages/News";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/businesses" component={Businesses} />
      <Route path="/toolkit" component={Toolkit} />
      <Route path="/syndication" component={Syndication} />
      <Route path="/news" component={News} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
