import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import Suppliers from "./pages/Suppliers";
import Tradespeople from "./pages/Tradespeople";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import GuestEstimate from "./pages/GuestEstimate";
import EstimateResult from "./pages/EstimateResult";
import HowItWorks from "./pages/HowItWorks";
import NewBuildEstimate from "./pages/NewBuildEstimate";
import NewBuildResult from "./pages/NewBuildResult";
import KitchenEstimator from "./pages/KitchenEstimator";
import KitchenEstimateResult from "./pages/KitchenEstimateResult";
import WaitlistBanner from "./components/WaitlistBanner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/tradespeople" component={Tradespeople} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/estimate" component={GuestEstimate} />
      <Route path="/estimate/result/:id" component={EstimateResult} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/new-build" component={NewBuildEstimate} />
      <Route path="/new-build-result/:leadId" component={NewBuildResult} />
      <Route path="/kitchen-estimator" component={KitchenEstimator} />
      <Route path="/kitchen-estimate/result/:id" component={KitchenEstimateResult} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <WaitlistBanner />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
