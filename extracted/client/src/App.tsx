import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Observatory from "./pages/Observatory";
import Insights from "./pages/Insights";
import Contact from "./pages/Contact";
import Resources from "./pages/Resources";

/*
 * CauseWay Website
 * Design Philosophy: Neo-Islamic Geometric Minimalism
 * 
 * A bilingual (English/Arabic) website for CauseWay Financial Consulting
 * featuring governance-safe financial solutions for banks, institutions,
 * and development partners.
 */

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={Services} />
      <Route path="/observatory" component={Observatory} />
      <Route path="/insights" component={Insights} />
      <Route path="/insights/:id" component={Insights} />
      <Route path="/contact" component={Contact} />
      <Route path="/resources" component={Resources} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: '#2C3424',
                  color: '#DADED8',
                  border: '1px solid #C9A227',
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
