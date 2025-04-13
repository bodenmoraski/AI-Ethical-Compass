import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { LanguageSelector } from "./LanguageSelector";

export const Navbar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
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
            <LanguageSelector />
            <button 
              type="button" 
              className="bg-primary-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors hover:bg-primary-700 ml-2" 
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <span className="material-icons">
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 