"use client";

/** Light / dark switch, same idea as the dashboard's: one button, remembered in this browser, light (Porcelain) by default. */
export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("og-theme", next); } catch { /* private mode: the choice just is not remembered */ }
  };
  return (
    <button type="button" className="ap-icon" onClick={toggle} aria-label="Switch between light and dark mode" title="Light / dark">
      <svg className="ap-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
      <svg className="ap-sun" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></g></svg>
    </button>
  );
}
