import { NavLink } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              About
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  to="/about"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  Our Mission
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/resources"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  Resources
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  to="/terms"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/privacy"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  Privacy Policy
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  to="/contact"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  Get in Touch
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8">
          <p className="text-base text-neutral-500 text-center">
            © {new Date().getFullYear()} AI Ethical Compass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}; 