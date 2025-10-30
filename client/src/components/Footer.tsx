import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              {t('footer.sections.about')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  to="/about"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  {t('footer.links.ourMission')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/resources"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  {t('footer.links.resources')}
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              {t('footer.sections.legal')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  to="/terms"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  {t('footer.links.termsOfService')}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/privacy"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  {t('footer.links.privacyPolicy')}
                </NavLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              {t('footer.sections.contact')}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <NavLink
                  to="/contact"
                  className="text-base text-neutral-500 hover:text-neutral-900"
                >
                  {t('footer.links.getInTouch')}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-8">
          <p className="text-base text-neutral-500 text-center">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}; 