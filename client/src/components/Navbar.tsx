import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu";

export const Navbar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
                to="/user-scenarios"
                className={({ isActive }) => 
                  isActive 
                    ? "border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium" 
                    : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 px-1 py-4 text-sm font-medium transition-colors"
                }
              >
                Community
              </NavLink>
              <NavLink 
                to="/leaderboard"
                className={({ isActive }) => 
                  isActive 
                    ? "border-b-2 border-primary-600 text-primary-600 px-1 py-4 text-sm font-medium" 
                    : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 px-1 py-4 text-sm font-medium transition-colors"
                }
              >
                Leaderboard
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
          <div className="flex items-center space-x-3">
            <LanguageSelector />
            
            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <UserMenu />
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <span className="material-icons mr-1 text-sm">person</span>
                Sign In
              </Button>
            )}
            
            <button 
              type="button" 
              className="bg-primary-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors hover:bg-primary-700" 
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
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}; 