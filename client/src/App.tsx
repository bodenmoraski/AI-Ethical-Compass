import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Resources from "@/pages/Resources";
import ScenarioView from "@/components/ScenarioView";
import Scenarios from "@/pages/Scenarios";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import AccessibilityControls from "@/components/AccessibilityControls";
import "@/styles/accessibility.css";

const queryClient = new QueryClient();

function App() {
  const handleFontSizeChange = (size: number) => {
    document.documentElement.style.setProperty('--font-size', `${size}px`);
  };

  const handleHighContrastToggle = (enabled: boolean) => {
    document.documentElement.classList.toggle('high-contrast', enabled);
  };

  const handleScreenReaderToggle = (enabled: boolean) => {
    document.documentElement.setAttribute('aria-live', enabled ? 'polite' : 'off');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/scenarios/:id" element={<ScenarioView />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
          <Toaster />
          <AccessibilityControls
            onFontSizeChange={handleFontSizeChange}
            onHighContrastToggle={handleHighContrastToggle}
            onScreenReaderToggle={handleScreenReaderToggle}
          />
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
