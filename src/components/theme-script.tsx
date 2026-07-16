// Applies a stored theme override before paint, avoiding a light/dark flash.
// With no stored preference, CSS alone follows the OS via prefers-color-scheme.
const THEME_INIT = `
(function () {
  try {
    var stored = localStorage.getItem("cc-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  );
}
