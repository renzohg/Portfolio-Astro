import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import '../assets/navbar.css';
import { useTranslations } from '../i18n/utils';

// Constants moved outside to prevent re-creation and frozen for safety
const LANG = 'en';
const THEMES = Object.freeze({
  moon: ['#0B0C0D', '#0F0F0F', '#181818', '#ffffff', '#020202', '#9e9e9e', '#d2d438', '#333333', '#333333', '#181818'],
  sun: ['#FFFFFF', '#F3F4F6', '#FFFFFF', '#111827', '#020202', '#4B5563', '#2563EB', '#F3F4F6', '#9CA3AF', '#E5E7EB'],
  sunset: ['#0F172A', '#1E293B', '#334155', '#ffffff', '#020202', '#94A3B8', '#FCD34D', '#1E293B', '#334155', '#334155'],
  sunrise: ['#F08080', '#F4978E', '#be766f', '#2C2C2CFF', '#020202', 'rgb(63, 50, 50)', '#3F3F3FFF', '#F8AD9D', 'rgb(190, 119, 112)', '#be766f'],
});

const THEMES_THG = Object.freeze({
  moon: ['#E34F26', '#1572B6', '#F7DF1E', '#7952B3', '#4A90E2', '#4A90E2', '#2a2e35'],
  sun: ['#111827', '#111827', '#111827', '#111827', '#111827', '#111827', '#D1D5DB'],
  sunset: ['#FCD34D', '#FCD34D', '#FCD34D', '#FCD34D', '#FCD34D', '#FCD34D', '#334155'],
  sunrise: ['#271313FF', '#271313FF', '#271313FF', '#271313FF', '#271313FF', '#271313FF', '#af6f69'],
});

const ROUTES = Object.freeze({
  en: '/en/',
  es: '/es/',
  fr: '/fr/',
  pt: '/pt/'
});

/**
 * Helper for safe LocalStorage access
 */
const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage access blocked:', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage write blocked:', e);
    }
  }
};

// Memoized ColorCircles component to prevent unnecessary re-renders
const ColorCircles = React.memo(({ theme }) => {
  const colors = THEMES[theme];
  if (!colors) return null;

  return (
    <div className="color-circles">
      {colors.map((color, index) => (
        <span
          key={index}
          className="circle"
          style={{ backgroundColor: color }}
        ></span>
      ))}
    </div>
  );
});

ColorCircles.displayName = 'ColorCircles';

const Navbar = () => {
  const t = useMemo(() => useTranslations(LANG), []);
  const [activeMenu, setActiveMenu] = useState(null); // 'menu', 'language', 'theme', or null
  const [selectedTheme, setSelectedTheme] = useState('moon');

  // Use 'en' consistently to match routes
  const [selectedLanguage, setSelectedLanguage] = useState(LANG);

  useLayoutEffect(() => {
    const savedLang = storage.get('lang');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  // Use a ref for the style root to avoid layout thrashing during updates
  const rootRef = useRef(null);

  /**
   * Batched CSS update function.
   * Applying changes via useLayoutEffect to prevent flash of unstyled theme.
   * Optimized: Removed filter-based property updates for CPU performance.
   */
  const applyThemeStyles = useCallback((theme) => {
    const colors = THEMES[theme];
    const thgColors = THEMES_THG[theme];
    if (!colors) return;

    const root = rootRef.current || document.documentElement;
    const style = root.style;

    // Batch all CSS variable updates
    style.setProperty('--color-navbar', colors[0]);
    style.setProperty('--color-fondo', colors[1]);
    style.setProperty('--color-fondo-card', colors[2]);
    style.setProperty('--color-texto', colors[3]);
    style.setProperty('--color-fondo-menu', colors[4]);
    style.setProperty('--color-text-secundario', colors[5]);
    style.setProperty('--color-scroll-down-hover', colors[5]);
    style.setProperty('--color-texto-titulo', colors[6]);
    style.setProperty('--color-fondo-titulos', colors[7]);
    style.setProperty('--color-scroll-down', colors[8]);
    style.setProperty('--color-arrow', colors[9]);

    if (theme === 'sunrise') {
      style.setProperty('--color-badge-text', '#000000');
      style.setProperty('--color-badge-border', 'rgba(0, 0, 0, 0.3)');
      style.setProperty('--color-badge-dot', '#000000');
    } else {
      style.setProperty('--color-badge-text', '#22b658');
      style.setProperty('--color-badge-border', 'rgba(34, 197, 94, 0.3)');
      style.setProperty('--color-badge-dot', '#22c55e');
    }

    if (thgColors) {
      const vars = ['--html', '--css', '--js', '--bts', '--cloud', '--react', '--icon'];
      vars.forEach((v, i) => style.setProperty(v, thgColors[i]));

      const isLightMode = theme === 'sun' || theme === 'sunrise';
      const navbarIcons = document.querySelectorAll('.theme-input, .language-input');
      navbarIcons.forEach(icon => {
        icon.style.filter = isLightMode ? 'brightness(0)' : 'none';
      });

      const whiteIcons = ['linkedin-icon', 'github-icon', 'instagram', 'linkedin', 'github', 'copyy'];
      whiteIcons.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.filter = isLightMode ? 'brightness(0)' : 'none';
      });

      const folderIcons = document.querySelectorAll('.folder-icon');
      folderIcons.forEach(icon => {
        icon.style.stroke = theme === 'sunrise' ? '#000000' : '#f5a623';
      });

      const iconSrc = (theme === 'moon' || theme === 'sunset') ? '/SVG/expressw.svg' : '/SVG/express.svg';
      ['first-project-express-icon', 'skills-express-icon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = iconSrc;
      });
    }
  }, []);

  // Initialize rootRef and load saved theme
  useLayoutEffect(() => {
    rootRef.current = document.documentElement;
    const savedTheme = storage.get('selectedTheme');
    if (savedTheme && THEMES[savedTheme]) {
      setSelectedTheme(savedTheme);
      applyThemeStyles(savedTheme);
    }
  }, [applyThemeStyles]);

  // Handle outside clicks to close menus
  useEffect(() => {
    if (!activeMenu) return;

    const handleCaptureClick = () => setActiveMenu(null);
    document.addEventListener('click', handleCaptureClick);
    return () => document.removeEventListener('click', handleCaptureClick);
  }, [activeMenu]);

  // Memoized handlers
  const toggleMenu = useCallback((e) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === 'menu' ? null : 'menu'));
  }, []);

  const toggleLanguage = useCallback((e) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === 'language' ? null : 'language'));
  }, []);

  const toggleThemeMenu = useCallback((e) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === 'theme' ? null : 'theme'));
  }, []);

  const closeMenus = useCallback(() => setActiveMenu(null), []);

  const handleThemeChange = useCallback((theme) => {
    setSelectedTheme(theme);
    storage.set('selectedTheme', theme);
    applyThemeStyles(theme);
    setActiveMenu(null);
  }, [applyThemeStyles]);

  const handleLanguageChange = useCallback((language) => {
    setSelectedLanguage(language);
    setActiveMenu(null);
    storage.set('lang', language);
    if (window.changeLanguage) {
      window.changeLanguage(language);
    }
  }, []);

  // Derived state for better clarity
  const isMenuOpen = activeMenu === 'menu';
  const isLanguageOpen = activeMenu === 'language';
  const isThemeOpen = activeMenu === 'theme';
  const anyOpen = !!activeMenu;

  return (
    <div className={`navbar ${anyOpen ? 'menu-open' : ''}`}>
      <div className={`menu-overlay ${anyOpen ? 'open' : ''}`} onClick={closeMenus} />
      <div className="line" />
      <nav className="navbar">
        <div className="container">
          <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
            <div className="menu-title">Menu</div>
            <a href="#about"><button id="about-navbar" data-i18n="about-navbar" onClick={closeMenus}>{t('about-navbar')}</button></a>
            <a href="#projects"><button id="projects-navbar" data-i18n="projects-navbar" onClick={closeMenus}>{t('projects-navbar')}</button></a>
            <a href="#skills"><button id="skills-navbar" data-i18n="skills-navbar" onClick={closeMenus}>{t('skills-navbar')}</button></a>
            <a href="#contact"><button id="contact-navbar" data-i18n="contact-navbar" onClick={closeMenus}>{t('contact-navbar')}</button></a>
          </div>

          <button className="menu-toggle" aria-label="Abrir menú" onClick={toggleMenu}>
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </div>
          </button>

          <div className="navbar-actions">
            <div className="theme-select-container">
              <img
                src={`/${selectedTheme}.webp`}
                alt="Tema actual"
                className="theme-input"
                onClick={toggleThemeMenu}
              />
              <div className={`theme-options ${isThemeOpen ? 'open' : ''}`}>
                <div id="theme-navbar" className="theme-title" data-i18n="theme-navbar">{t('theme-navbar') || 'Theme'}</div>
                {Object.keys(THEMES).map(themeKey => (
                  <div key={themeKey} className="theme-option" onClick={() => handleThemeChange(themeKey)}>
                    <img src={`/${themeKey}.webp`} alt={themeKey} />
                    <span id={`${themeKey}-navbar`} data-i18n={`${themeKey}-navbar`}>{t(`${themeKey}-navbar`)}</span>
                    <ColorCircles theme={themeKey} />
                  </div>
                ))}
              </div>
            </div>

            <div className="language-select-container">
              <div className="idioma">
                <img src="/SVG/language.svg" alt="Idioma" className="language-input" onClick={toggleLanguage} />
              </div>
              <div className={`language-options ${isLanguageOpen ? 'open' : ''}`}>
                <div id="language-navbar" className="language-title" data-i18n="language-navbar">{t('language-navbar') || 'Language'}</div>
                {[
                  { id: 'englishh', val: 'en', label: 'English', icon: '/SVG/uk.svg' },
                  { id: 'spanishh', val: 'es', label: 'Español', icon: '/SVG/spain.svg' },
                  { id: 'frenchh', val: 'fr', label: 'Français', icon: '/SVG/france.svg' },
                  { id: 'portuguesee', val: 'pt', label: 'Português', icon: '/SVG/brazil.svg' },
                ].map(l => (
                  <label key={l.val}>
                    <input
                      id={l.id}
                      type="radio"
                      name="lang"
                      value={l.val}
                      checked={selectedLanguage === l.val}
                      onChange={() => handleLanguageChange(l.val)}
                    />
                    <img src={l.icon} alt={l.label} />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default React.memo(Navbar);
