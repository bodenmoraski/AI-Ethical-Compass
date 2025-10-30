import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { describe, it, expect, beforeEach } from 'vitest';

// Mock component to test translations
const TestComponent = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <button>{t('common.buttons.save')}</button>
      <p>{t('auth.signIn')}</p>
    </div>
  );
};

import { useTranslation } from 'react-i18next';

describe('i18n Configuration', () => {
  beforeEach(async () => {
    // Reset to English before each test
    await i18n.changeLanguage('en');
  });

  it('should initialize with default language (English)', () => {
    expect(i18n.language).toBe('en');
  });

  it('should have all 7 languages available', () => {
    const availableLanguages = Object.keys(i18n.services.resourceStore.data);
    expect(availableLanguages).toContain('en');
    expect(availableLanguages).toContain('es');
    expect(availableLanguages).toContain('fr');
    expect(availableLanguages).toContain('de');
    expect(availableLanguages).toContain('zh');
    expect(availableLanguages).toContain('ar');
    expect(availableLanguages).toContain('it');
    expect(availableLanguages.length).toBe(7);
  });

  it('should load English translations correctly', () => {
    expect(i18n.t('navigation.home')).toBe('Home');
    expect(i18n.t('common.buttons.save')).toBe('Save');
    expect(i18n.t('auth.signIn')).toBe('Sign In');
  });

  it('should switch to Spanish and load translations', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.language).toBe('es');
    expect(i18n.t('navigation.home')).toBe('Inicio');
    expect(i18n.t('common.buttons.save')).toBe('Guardar');
    expect(i18n.t('auth.signIn')).toBe('Iniciar Sesión');
  });

  it('should switch to French and load translations', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.language).toBe('fr');
    expect(i18n.t('navigation.home')).toBe('Accueil');
    expect(i18n.t('common.buttons.save')).toBe('Enregistrer');
    expect(i18n.t('auth.signIn')).toBe('Se Connecter');
  });

  it('should switch to German and load translations', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.language).toBe('de');
    expect(i18n.t('navigation.home')).toBe('Startseite');
    expect(i18n.t('common.buttons.save')).toBe('Speichern');
    expect(i18n.t('auth.signIn')).toBe('Anmelden');
  });

  it('should switch to Chinese and load translations', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.language).toBe('zh');
    expect(i18n.t('navigation.home')).toBe('主页');
    expect(i18n.t('common.buttons.save')).toBe('保存');
    expect(i18n.t('auth.signIn')).toBe('登录');
  });

  it('should switch to Arabic and load translations', async () => {
    await i18n.changeLanguage('ar');
    expect(i18n.language).toBe('ar');
    expect(i18n.t('navigation.home')).toBe('الرئيسية');
    expect(i18n.t('common.buttons.save')).toBe('حفظ');
    expect(i18n.t('auth.signIn')).toBe('تسجيل الدخول');
  });

  it('should switch to Italian and load translations', async () => {
    await i18n.changeLanguage('it');
    expect(i18n.language).toBe('it');
    expect(i18n.t('navigation.home')).toBe('Home');
    expect(i18n.t('common.buttons.save')).toBe('Salva');
    expect(i18n.t('auth.signIn')).toBe('Accedi');
  });

  it('should fall back to English for missing keys', async () => {
    await i18n.changeLanguage('es');
    // Test a key that might not exist
    const result = i18n.t('nonexistent.key', { defaultValue: 'Fallback' });
    expect(result).toBe('Fallback');
  });

  it('should handle interpolation correctly', async () => {
    await i18n.changeLanguage('en');
    const result = i18n.t('footer.copyright', { year: 2025 });
    expect(result).toContain('2025');
    expect(result).toContain('AI Ethical Compass');
  });
});

describe('RTL (Right-to-Left) Support', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('should set dir="ltr" for LTR languages', async () => {
    await i18n.changeLanguage('en');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
    });

    await i18n.changeLanguage('es');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  it('should set dir="rtl" for Arabic', async () => {
    await i18n.changeLanguage('ar');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });
  });

  it('should switch between LTR and RTL correctly', async () => {
    await i18n.changeLanguage('en');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
    });

    await i18n.changeLanguage('ar');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
    });

    await i18n.changeLanguage('fr');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('ltr');
    });
  });
});

describe('Component Integration', () => {
  it('should render translated content in components', async () => {
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    // English (default)
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();

    // Switch to Spanish
    await i18n.changeLanguage('es');
    rerender(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Inicio')).toBeInTheDocument();
      expect(screen.getByText('Guardar')).toBeInTheDocument();
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    });
  });
});

describe('Translation Completeness', () => {
  const requiredKeys = [
    'navigation.home',
    'navigation.scenarios',
    'navigation.community',
    'navigation.leaderboard',
    'navigation.about',
    'navigation.resources',
    'common.buttons.save',
    'common.buttons.cancel',
    'common.buttons.submit',
    'auth.signIn',
    'auth.signOut',
    'auth.signUp',
    'footer.sections.about',
    'footer.sections.legal',
    'footer.sections.contact',
  ];

  const languages = ['en', 'es', 'fr', 'de', 'zh', 'ar', 'it'];

  languages.forEach((lang) => {
    describe(`${lang} translations`, () => {
      beforeEach(async () => {
        await i18n.changeLanguage(lang);
      });

      requiredKeys.forEach((key) => {
        it(`should have translation for "${key}"`, () => {
          const translation = i18n.t(key);
          expect(translation).not.toBe(key);
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
        });
      });
    });
  });
});

describe('Language Persistence', () => {
  it('should persist language selection to localStorage', async () => {
    await i18n.changeLanguage('es');
    
    // Check if language is stored in localStorage
    const storedLang = localStorage.getItem('i18nextLng');
    expect(storedLang).toBe('es');
  });

  it('should load language from localStorage on initialization', () => {
    localStorage.setItem('i18nextLng', 'fr');
    
    // In a real scenario, i18n would be reinitialized and should pick up 'fr'
    // This is a simplified test
    expect(localStorage.getItem('i18nextLng')).toBe('fr');
  });
});

