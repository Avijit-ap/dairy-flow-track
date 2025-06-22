
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Areas from "./pages/Areas";
import Deliveries from "./pages/Deliveries";
import Subscriptions from "./pages/Subscriptions";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole={['admin']}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/areas" element={
              <ProtectedRoute requiredRole={['admin', 'distributor']}>
                <Areas />
              </ProtectedRoute>
            } />
            <Route path="/deliveries" element={
              <ProtectedRoute requiredRole={['admin', 'agent']}>
                <Deliveries />
              </ProtectedRoute>
            } />
            <Route path="/subscriptions" element={
              <ProtectedRoute requiredRole={['admin', 'customer', 'distributor']}>
                <Subscriptions />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
