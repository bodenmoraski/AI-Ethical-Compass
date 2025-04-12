import { Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Scenarios from "@/pages/Scenarios";
import About from "@/pages/About";
import Instructions from "@/pages/Instructions";
import Resources from "@/pages/Resources";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "@/pages/Contact";
import Layout from "@/components/Layout";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="scenarios" element={<Scenarios />} />
        <Route path="scenarios/:id" element={<Scenarios />} />
        <Route path="about" element={<About />} />
        <Route path="instructions" element={<Instructions />} />
        <Route path="resources" element={<Resources />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
