document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  const headerElement = document.querySelector('header');
  if (headerElement) {
    headerElement.className = "header";
    headerElement.innerHTML = HeaderHTML;
    // Active link is now handled by router.js
    
    // Initial update of header state
    updateHeaderState();
    
    // Initialize Header Search
    initHeaderSearch();
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

// --- Global Search Index Definition ---
const GLOBAL_SEARCH_INDEX = [
    // Equipment Data
    { id: 'eq-1', type: 'equipment', title: '트레드밀 (러닝머신)', subtitle: '운동안내 > 유산소', keywords: '하체, 심폐지구력, 다이어트, 런닝머신', url: '#/equipment' },
    { id: 'eq-2', type: 'equipment', title: '덤벨', subtitle: '운동안내 > 근력', keywords: '팔, 어깨, 가슴, 등, 프리웨이트, 아령', url: '#/equipment' },
    { id: 'eq-3', type: 'equipment', title: '벤치프레스', subtitle: '운동안내 > 근력', keywords: '가슴, 대흉근, 삼두, 어깨, 상체 운동', url: '#/equipment' },
    { id: 'eq-4', type: 'equipment', title: '레그 프레스', subtitle: '운동안내 > 근력', keywords: '하체, 허벅지, 대퇴사두근, 둔근, 다리 운동', url: '#/equipment' },
    { id: 'eq-5', type: 'equipment', title: '랫 풀 다운', subtitle: '운동안내 > 근력', keywords: '등, 광배근, 턱걸이, 상체 운동', url: '#/equipment' },
    { id: 'eq-6', type: 'equipment', title: '케틀벨', subtitle: '운동안내 > 전신', keywords: '코어, 둔근, 유산소, 스윙, 홈트', url: '#/equipment' },
    
    // FAQ Data
    { id: 'faq-1', type: 'faq', title: '헬스장 어디가 좋아요?', subtitle: '고객센터 > 등록', keywords: '위치, 선정 기준', url: '#/customer-service' },
    { id: 'faq-2', type: 'faq', title: 'PT 어떻게 골라요?', subtitle: '고객센터 > PT', keywords: '트레이너 선택, 자격증', url: '#/customer-service' },
    { id: 'faq-3', type: 'faq', title: '특정 부위가 아픈데 보호대 사요?', subtitle: '고객센터 > 장비', keywords: '통증, 보호대, 부상 방지', url: '#/customer-service' },
    { id: 'faq-4', type: 'faq', title: '스트랩 뭐 사요? 베르사 그립 사요?', subtitle: '고객센터 > 장비', keywords: '스트랩, 그립, 악력', url: '#/customer-service' },
    { id: 'faq-5', type: 'faq', title: '벨트 뭐가 좋아요?', subtitle: '고객센터 > 장비', keywords: '리프팅 벨트, 복압, 허리 보호', url: '#/customer-service' },
    { id: 'faq-6', type: 'faq', title: '유산소랑 무산소 중에 뭐가 좋아요?', subtitle: '고객센터 > 운동', keywords: '다이어트, 근성장, 순서', url: '#/customer-service' },
    { id: 'faq-7', type: 'faq', title: '정체기 왔는데 어떻게 뚫어요?', subtitle: '고객센터 > 운동', keywords: '정체기, 중량, 횟수', url: '#/customer-service' },
    { id: 'faq-8', type: 'faq', title: '운동 루틴 어떻게 짜요?', subtitle: '고객센터 > 운동', keywords: '루틴, 프로그램, 분할', url: '#/customer-service' },
    { id: 'faq-9', type: 'faq', title: '보충제 꼭 먹어야 해요?', subtitle: '고객센터 > 식단', keywords: '보충제, 단백질, 프로틴', url: '#/customer-service' },
    { id: 'faq-10', type: 'faq', title: '닭가슴살 맛없는데 다른 건 없나요?', subtitle: '고객센터 > 식단', keywords: '닭가슴살, 대체 식품, 단백질', url: '#/customer-service' },
    { id: 'faq-11', type: 'faq', title: '마카? 아르기닌? 좋은 건가요?', subtitle: '고객센터 > 식단', keywords: '영양제, 부스터, 활력', url: '#/customer-service' },
    
    // Basic Navigation
    { id: 'nav-1', type: 'nav', title: '시설 소개', subtitle: 'About > 시설 안내', keywords: '위치, 운영시간', url: '#/about' },
    { id: 'nav-2', type: 'nav', title: '공지사항', subtitle: 'Notice > 주요 소식', keywords: '이벤트, 휴관일', url: '#/notice' },
    { id: 'nav-3', type: 'nav', title: '마이페이지', subtitle: 'MyPage > 개인정보', keywords: '회원권', url: '#/mypage' },
];

// Header Search Logic
function initHeaderSearch() {
  const searchContainer = document.getElementById('header-search');
  if (!searchContainer) return;

  const searchInput = searchContainer.querySelector('.header-search-input');
  const resultsContainer = document.getElementById('search-results');

  // Expand on click
  searchContainer.addEventListener('click', function(e) {
    this.classList.add('active');
    searchInput.focus();
  });

  // Collapse on click outside
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      if (searchInput.value.trim() === '') {
        searchContainer.classList.remove('active');
        hideResults();
      } else {
        // If has value but clicked outside, just hide results but keep expanded?
        // For now, keep expanded but hide results is better UX usually
        hideResults();
      }
    }
  });

  // Search Input Handler
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
        const results = searchData(query);
        renderResults(results);
    } else {
        hideResults();
    }
  });

  function searchData(query) {
      const lowerQuery = query.toLowerCase();
      const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 0);
      
      return GLOBAL_SEARCH_INDEX.filter(item => {
          const title = item.title.toLowerCase();
          const subtitle = item.subtitle.toLowerCase();
          const itemKeywords = item.keywords ? item.keywords.toLowerCase() : '';
          
          // Check if ALL keywords are present in title, subtitle, OR keywords field
          return keywords.every(keyword => 
              title.includes(keyword) || 
              subtitle.includes(keyword) ||
              itemKeywords.includes(keyword)
          );
      });
  }

  function renderResults(results) {
      resultsContainer.innerHTML = '';
      
      if (results.length === 0) {
          resultsContainer.innerHTML = '<div class="search-empty">검색 결과가 없습니다.</div>';
      } else {
          results.forEach(item => {
              const el = document.createElement('a');
              el.href = item.url; // Fallback
              el.className = 'search-result-item';
              
              // Icon based on type
              let iconName = 'search';
              if (item.type === 'equipment') iconName = 'activity';
              else if (item.type === 'faq') iconName = 'message-square';
              else if (item.type === 'nav') iconName = 'arrow-right-circle';

              el.innerHTML = `
                  <div class="search-result-icon">
                      <i data-lucide="${iconName}"></i>
                  </div>
                  <div class="search-result-text">
                      <span class="search-result-title">${item.title}</span>
                      <span class="search-result-subtitle">${item.subtitle}</span>
                  </div>
              `;

              // Click Handler
              el.addEventListener('click', (e) => {
                  e.preventDefault(); // Handle navigation manually
                  
                  // Navigate
                  window.location.hash = item.url;
                  
                  // Specific Action handling
                  if (item.type === 'equipment') {
                      // Store target ID to open tab on Equipment page load
                      sessionStorage.setItem('targetEquipmentId', item.id);
                  } else if (item.type === 'faq') {
                      // Store target ID to open accordion on CS page load
                      // Strip 'faq-' prefix to match the numeric IDs in the CS module
                      const numericId = item.id.replace('faq-', '');
                      sessionStorage.setItem('targetFaqId', numericId);
                  }

                  // Close search
                  hideResults();
                  searchInput.value = '';
                  searchContainer.classList.remove('active');
              });

              resultsContainer.appendChild(el);
          });
          
          // Re-init icons
          if (window.lucide) lucide.createIcons();
      }

      resultsContainer.classList.add('show');
  }

  function hideResults() {
      if (resultsContainer) {
          resultsContainer.classList.remove('show');
          // Timeout to clear content for animation
          setTimeout(() => {
              if(!resultsContainer.classList.contains('show')) {
                  resultsContainer.innerHTML = '';
              }
          }, 200);
      }
  }
}

// Global function to update header based on login state
window.updateHeaderState = function() {
  const btn = document.querySelector('.header-mypage-btn');
  if (!btn) return;

  // Check 'gym_user' which is used in mypage logic
  const user = localStorage.getItem('gym_user');
  
  if (user) {
    // Logged In: Show My Page
    btn.innerHTML = `
      <i data-lucide="user" class="header-mypage-icon"></i>
      <span class="header-mypage-text">마이페이지</span>
    `;
    // Update link href to point to mypage (which handles its own view)
    btn.setAttribute('href', '#/mypage');
  } else {
    // Logged Out: Show Login
    btn.innerHTML = `
      <i data-lucide="log-in" class="header-mypage-icon"></i>
      <span class="header-mypage-text">로그인</span>
    `;
    // Ensure clicking it goes to mypage (which defaults to login view if no user)
    btn.setAttribute('href', '#/mypage');
  }

  // Re-initialize icons for the new content
  if (window.lucide) {
    lucide.createIcons();
  }
};