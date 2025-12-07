import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import '@/lib/i18n';
import { getCurrentLanguage } from '@/lib/i18n';
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Business from "./pages/Business";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BusinessCreate from "./pages/BusinessCreate";
import BusinessManage from "./pages/BusinessManage";
import Payment from "./pages/Payment";
import HowToUse from "./pages/HowToUse";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  useEffect(() => {
    const lang = getCurrentLanguage();
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/business/new" element={<BusinessCreate />} />
            <Route path="/business/:id" element={<Business />} />
            <Route path="/business/:id/manage" element={<BusinessManage />} />
            <Route path="/dashboard" element={<Dashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
