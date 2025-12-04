import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DemoBanner from "./components/DemoBanner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ExperienceProvider } from "./contexts/ExperienceContext";
import Welcome from "./pages/Welcome";
import Registration from "./pages/Registration";
import Conversation from "./pages/Conversation";
import Synthesis from "./pages/Synthesis";
import Minting from "./pages/Minting";
import Complete from "./pages/Complete";
import { stripBasePath, addBasePath } from "./lib/routing";

// Custom router hook that handles base path
function useBasePathRouter() {
  const [updateCounter, setUpdateCounter] = useState(0);
  const [location, setLocationState] = useState(() => stripBasePath(window.location.pathname));
  
  useEffect(() => {
    const updateLocation = () => {
      const newLocation = stripBasePath(window.location.pathname);
      setLocationState(newLocation);
      setUpdateCounter(prev => prev + 1);
    };
    
    // Listen to popstate events (browser back/forward)
    window.addEventListener("popstate", updateLocation);
    
    // Also listen for custom navigation events
    const handleNavigation = () => {
      const newLocation = stripBasePath(window.location.pathname);
      setLocationState(newLocation);
      setUpdateCounter(prev => prev + 1);
    };
    window.addEventListener("pushstate", handleNavigation);
    window.addEventListener("replacestate", handleNavigation);
    
    return () => {
      window.removeEventListener("popstate", updateLocation);
      window.removeEventListener("pushstate", handleNavigation);
      window.removeEventListener("replacestate", handleNavigation);
    };
  }, []);
  
  // Set location with base path
  const setLocation = (path: string, replace = false) => {
    const fullPath = addBasePath(path);
    const newLocation = stripBasePath(fullPath);
    
    if (replace) {
      window.history.replaceState("", "", fullPath);
      window.dispatchEvent(new Event("replacestate"));
    } else {
      window.history.pushState("", "", fullPath);
      window.dispatchEvent(new Event("pushstate"));
    }
    
    // Update state immediately
    setLocationState(newLocation);
    setUpdateCounter(prev => prev + 1);
  };
  
  // Use location state (reactive) instead of reading from window directly
  return [location, setLocation] as const;
}

function Router() {
  return (
    <WouterRouter hook={useBasePathRouter}>
      <Switch>
        <Route path={"/"} component={Welcome} />
        <Route path="/registration" component={Registration} />
        <Route path="/corridor/:agentId" component={Conversation} />
        <Route path="/synthesis" component={Synthesis} />
        <Route path="/minting" component={Minting} />
        <Route path="/complete" component={Complete} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <ExperienceProvider>
          <TooltipProvider>
            <DemoBanner />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ExperienceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
