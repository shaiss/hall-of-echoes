import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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

function Router() {
  return (
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
