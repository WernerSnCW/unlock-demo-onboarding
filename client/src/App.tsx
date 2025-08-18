import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Components from "@/pages/Components";
import Docs from "@/pages/Docs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/components" component={Components} />
      <Route path="/docs" component={Docs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1
        className="text-4xl font-bold mb-6"
        style={{ color: "var(--primary)" }}
      >
        Unlock App – Colour Test
      </h1>

      <div
        className="p-6 rounded-lg shadow-lg mb-6"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
      >
        This is a card using --card colours
      </div>

      <button
        className="px-6 py-3 rounded-lg text-lg font-medium"
        style={{
          background: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        Primary Button
      </button>
    </div>
  );
}

export default App;
