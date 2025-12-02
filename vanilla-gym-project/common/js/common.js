document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  const headerElement = document.querySelector('header');
  if (headerElement) {
    headerElement.className = "header";
    headerElement.innerHTML = HeaderHTML;
    // Active link is now handled by router.js
    
    // Initial update of header state
    updateHeaderState();
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

// Global function to update header based on login state
window.updateHeaderState = function() {
  const btn = document.querySelector('.header-mypage-btn');
  if (!btn) return;

  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  
  if (isLoggedIn) {
    btn.innerHTML = `
      <i data-lucide="user" class="header-mypage-icon"></i>
      마이페이지
    `;
  } else {
    btn.innerHTML = `
      <i data-lucide="log-in" class="header-mypage-icon"></i>
      로그인
    `;
  }

  // Re-initialize icons for the new content
  if (window.lucide) {
    lucide.createIcons();
  }
};