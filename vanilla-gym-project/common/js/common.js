document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  const headerElement = document.querySelector('header');
  if (headerElement) {
    headerElement.className = "header";
    headerElement.innerHTML = HeaderHTML;
    // Active link is now handled by router.js
  }

  // Load Footer
  const footerElement = document.querySelector('footer');
  if (footerElement) {
    footerElement.className = "footer";
    footerElement.innerHTML = FooterHTML;
  }

  // Initialize Icons
  if (window.lucide) {
    lucide.createIcons();
  }
});