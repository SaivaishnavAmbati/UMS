export const getSystemTheme = () => {
  const saved = localStorage.getItem('ums_theme');
  return saved || 'dark'; // Dark theme is default for UMS
};

export const applyTheme = (theme) => {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('ums_theme', theme);
};
