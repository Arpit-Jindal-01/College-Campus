import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CampusConnectProvider } from "@/contexts/CampusConnectContext";
import { DatingModeProvider } from "@/contexts/DatingModeContext";
import Chatbot from "@/components/campus-connect/Chatbot";

// Campus Connect Pages
import CampusLanding from "./pages/campus-connect/Landing";
import CampusAuth from "./pages/campus-connect/Auth";
import CampusOnboarding from "./pages/campus-connect/Onboarding";
import CampusHome from "./pages/campus-connect/Home";
import CampusDiscover from "./pages/campus-connect/Discover";
import CampusMatches from "./pages/campus-connect/Matches";
import CampusChat from "./pages/campus-connect/Chat";
import CampusProfile from "./pages/campus-connect/Profile";
import CampusUserProfile from "./pages/campus-connect/UserProfile";
import AdminPanel from "./pages/campus-connect/Admin";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Campus Connect as default app */}
      <Route path="/landing" element={<CampusLanding />} />
      <Route path="/auth" element={<CampusAuth />} />
      <Route path="/onboarding" element={<CampusOnboarding />} />
      <Route path="/" element={<CampusHome />} />
      <Route path="/discover" element={<CampusDiscover />} />
      <Route path="/matches" element={<CampusMatches />} />
      <Route path="/chat/:matchId" element={<CampusChat />} />
      <Route path="/profile" element={<CampusProfile />} />
      <Route path="/user/:userId" element={<CampusUserProfile />} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CampusConnectProvider>
        <DatingModeProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
            <Chatbot />
          </BrowserRouter>
        </DatingModeProvider>
      </CampusConnectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
