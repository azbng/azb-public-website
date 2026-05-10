import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { runtimeConfig } from "@/lib/runtimeConfig";
import Layout from "@/components/Layout";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Subsidiaries from "./pages/Subsidiaries.tsx";
import SubsidiaryDetail from "./pages/SubsidiaryDetail.tsx";
import GalleryPage from "./pages/GalleryPage.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import SolarLayout from "./pages/solar/SolarLayout.tsx";
import SolarAuth from "./pages/solar/SolarAuth.tsx";
import SolarVerifyEmail from "./pages/solar/SolarVerifyEmail.tsx";
import SolarDashboard from "./pages/solar/SolarDashboard.tsx";
import SolarKyc from "./pages/solar/SolarKyc.tsx";
import SolarLoan from "./pages/solar/SolarLoan.tsx";
import SolarBooking from "./pages/solar/SolarBooking.tsx";
import SolarAdmin from "./pages/solar/SolarAdmin.tsx";
import SolarRequireAuth from "./pages/solar/SolarRequireAuth.tsx";

const queryClient = new QueryClient();

const OAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  if (!runtimeConfig.googleClientId) return <>{children}</>;
  return <GoogleOAuthProvider clientId={runtimeConfig.googleClientId}>{children}</GoogleOAuthProvider>;
};

const App = () => (
  <OAuthWrapper>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/subsidiaries" element={<Subsidiaries />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/contact" element={<Contact />} />

                {/* Solar subsidiary section with its own sub-header */}
                <Route path="/subsidiaries/solar" element={<SolarLayout />}>
                  <Route index element={<SubsidiaryDetail />} />
                  <Route path="auth" element={<SolarAuth />} />
                  <Route path="auth/verify-email" element={<SolarVerifyEmail />} />
                  <Route path="dashboard" element={<SolarRequireAuth><SolarDashboard /></SolarRequireAuth>} />
                  <Route path="kyc" element={<SolarRequireAuth><SolarKyc /></SolarRequireAuth>} />
                  <Route path="loan" element={<SolarRequireAuth><SolarLoan /></SolarRequireAuth>} />
                  <Route path="booking" element={<SolarRequireAuth><SolarBooking /></SolarRequireAuth>} />
                  <Route path="admin" element={<SolarRequireAuth admin><SolarAdmin /></SolarRequireAuth>} />
                </Route>

                {/* Other subsidiaries continue to use the standard detail page */}
                <Route path="/subsidiaries/:slug" element={<SubsidiaryDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </OAuthWrapper>
);

export default App;
