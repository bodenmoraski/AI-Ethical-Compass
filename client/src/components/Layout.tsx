import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Toggle high contrast mode
  const toggleHighContrast = () => {
    document.documentElement.classList.toggle("high-contrast");
    setHighContrast(!highContrast);
    toast({
      title: highContrast ? "Standard contrast mode enabled" : "High contrast mode enabled",
      description: "Display settings updated for accessibility.",
    });
  };

  return (
    <div className={`bg-neutral-50 text-neutral-900 min-h-screen flex flex-col`}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center" aria-label="AI Ethical Compass Home">
                <span className="material-icons text-primary-600 text-3xl mr-2">public</span>
                <span className="text-xl font-semibold text-neutral-900">AI Ethical Compass</span>
              </NavLink>
              <nav className="hidden md:ml-8 md:flex md:space-x-8" aria-label="Main Navigation">
                <NavLink 
                  to="/scenarios"
                  className={({ isActive }) => 
                    isActive 
                      ? "border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium" 
                      : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 px-1 py-4 text-sm font-medium transition-colors"
                  }
                >
                  Scenarios
                </NavLink>
                <NavLink 
                  to="/about"
                  className={({ isActive }) => 
                    isActive 
                      ? "border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium" 
                      : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 px-1 py-4 text-sm font-medium transition-colors"
                  }
                >
                  About
                </NavLink>
                <NavLink 
                  to="/instructions"
                  className={({ isActive }) => 
                    isActive 
                      ? "border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium" 
                      : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 px-1 py-4 text-sm font-medium transition-colors"
                  }
                >
                  Instructions
                </NavLink>
                <NavLink 
                  to="/resources"
                  className={({ isActive }) => 
                    isActive 
                      ? "border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium" 
                      : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 px-1 py-4 text-sm font-medium transition-colors"
                  }
                >
                  Resources
                </NavLink>
              </nav>
            </div>
            <div className="flex items-center">
              <button 
                type="button" 
                className="bg-primary-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors hover:bg-primary-700" 
                aria-label="Toggle high contrast mode"
                onClick={toggleHighContrast}
              >
                <span className="material-icons">contrast</span>
              </button>
              <button 
                type="button" 
                className="md:hidden ml-2 p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                aria-expanded={mobileMenuOpen}
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="material-icons">{mobileMenuOpen ? "close" : "menu"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "" : "hidden"}`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <NavLink
              to="/scenarios"
              className={({ isActive }) =>
                isActive
                  ? "bg-primary-50 border-l-4 border-primary-600 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                  : "border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 block pl-3 pr-4 py-2 text-base font-medium"
              }
            >
              Scenarios
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "bg-primary-50 border-l-4 border-primary-600 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                  : "border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 block pl-3 pr-4 py-2 text-base font-medium"
              }
            >
              About
            </NavLink>
            <NavLink
              to="/instructions"
              className={({ isActive }) =>
                isActive
                  ? "bg-primary-50 border-l-4 border-primary-600 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                  : "border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 block pl-3 pr-4 py-2 text-base font-medium"
              }
            >
              Instructions
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                isActive
                  ? "bg-primary-50 border-l-4 border-primary-600 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                  : "border-l-4 border-transparent text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-700 block pl-3 pr-4 py-2 text-base font-medium"
              }
            >
              Resources
            </NavLink>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="#" className="text-neutral-400 hover:text-neutral-600">
                <span className="sr-only">Terms of Use</span>
                <span className="text-sm">Terms of Use</span>
              </a>
              <a href="#" className="text-neutral-400 hover:text-neutral-600">
                <span className="sr-only">Privacy Policy</span>
                <span className="text-sm">Privacy Policy</span>
              </a>
              <a href="#" className="text-neutral-400 hover:text-neutral-600">
                <span className="sr-only">Contact</span>
                <span className="text-sm">Contact</span>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-sm text-neutral-500">&copy; {new Date().getFullYear()} AI Ethical Compass. All rights reserved.</p>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-neutral-400">
            <p>AI Ethical Compass is part of the ISTE+ASCD AI Innovator Challenge 2025, focused on digital inclusion and responsible citizenship.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
