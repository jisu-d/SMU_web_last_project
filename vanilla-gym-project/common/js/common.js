// --- 모의 데이터베이스 (데이터 시뮬레이션) ---

const COUPON_TYPES = {
    'WELCOME': { name: '신규 가입 환영 쿠폰', type: 'percent', value: 10, description: '10% 할인' },
    'SUMMER': { name: '여름 맞이 이벤트', type: 'fixed', value: 50000, description: '5만원 즉시 할인' },
    'PT_PROMO': { name: 'PT 패키지 할인', type: 'percent', value: 15, description: '15% 할인 (PT 전용)', target: 'pt' },
    'FRIENDS': { name: '지인 추천 쿠폰', type: 'fixed', value: 30000, description: '3만원 할인' },
    'X-mas': { name: '크리스마스 특별 할인', type: 'percent', value: 20, description: '20% 할인' }
};

const MEMBERS = {
    'user123': {
        name: '홍길동',
        password: '1234',
        contact: '010-1234-5678',
        coupons: ['WELCOME', 'FRIENDS', 'X-mas'], // 사용자가 보유한 쿠폰
        points: 2000,
        membershipExpire: null,
        ptCount: 0,
        locker: { number: 23, password: '4589' },
        reservations: [
            // 테스트용 과거 예약
            { id: 1, trainer: '엄희수', date: '2025-11-01', time: '10:00', createdAt: '2023-12-01T00:00:00.000Z' }
        ]
    },
    'djagmltn': {
        name: '엄희수',
        password: '1234',
        contact: '010-4334-4628',
        coupons: ['WELCOME', 'FRIENDS', 'X-mas'], // 사용자가 보유한 쿠폰
        points: 2000,
        membershipExpire: null,
        ptCount: 10,
        reservations: [
            // 테스트용 과거 예약
            { id: 1, trainer: '엄희수', date: '2025-11-01', time: '10:00', createdAt: '2023-12-01T00:00:00.000Z' }
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
  // 헤더 로드
  const headerElement = document.querySelector('header');
  if (headerElement) {
    headerElement.className = "header";
    headerElement.innerHTML = HeaderHTML;
    // 활성 링크는 router.js에서 처리됨
    
    // 헤더 상태 초기 업데이트
    updateHeaderState();
    
    // 헤더 검색 초기화
    initHeaderSearch();
    
    // 헤더 링크 리셋 로직:
    // 사용자가 현재 페이지의 링크를 클릭하면 상태를 리셋하기 위해 강제 리렌더링 (예: 목록 보기로 돌아가기)
    const headerLinks = document.querySelectorAll('.header-logo, .header-nav-link, .header-mypage-btn');
    headerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetHref = link.getAttribute('href');
            // 대상이 현재 해시와 같은지 확인 (정규화됨)
            // href는 "#/notice" 또는 "#/" 일 수 있음
            const currentHash = window.location.hash || '#/';
            const targetHash = targetHref || '#/';
            
            if (currentHash === targetHash) {
                e.preventDefault(); // 스크롤 점프 방지를 위해 기본 동작 막기
                if (window.router && typeof window.router.handleLocation === 'function') {
                    window.router.handleLocation();
                }
            }
        });
    });
  }

  // 푸터 로드
  const footerElement = document.querySelector('footer');
  if (footerElement) {
    footerElement.className = "footer";
    footerElement.innerHTML = FooterHTML;
  }

  // 아이콘 초기화
  if (window.lucide) {
    lucide.createIcons();
  }
});

// --- 전역 검색 인덱스 정의 ---
const GLOBAL_SEARCH_INDEX = [
    // 운동 기구 데이터
    { id: 'eq-1', type: 'equipment', title: '트레드밀 (러닝머신)', subtitle: '운동안내 > 유산소', keywords: '하체, 심폐지구력, 다이어트, 런닝머신', url: '#/equipment' },
    { id: 'eq-2', type: 'equipment', title: '덤벨', subtitle: '운동안내 > 근력', keywords: '팔, 어깨, 가슴, 등, 프리웨이트, 아령', url: '#/equipment' },
    { id: 'eq-3', type: 'equipment', title: '벤치프레스', subtitle: '운동안내 > 근력', keywords: '가슴, 대흉근, 삼두, 어깨, 상체 운동', url: '#/equipment' },
    { id: 'eq-4', type: 'equipment', title: '레그 프레스', subtitle: '운동안내 > 근력', keywords: '하체, 허벅지, 대퇴사두근, 둔근, 다리 운동', url: '#/equipment' },
    { id: 'eq-5', type: 'equipment', title: '랫 풀 다운', subtitle: '운동안내 > 근력', keywords: '등, 광배근, 턱걸이, 상체 운동', url: '#/equipment' },
    { id: 'eq-6', type: 'equipment', title: '케틀벨', subtitle: '운동안내 > 전신', keywords: '코어, 둔근, 유산소, 스윙, 홈트', url: '#/equipment' },
    
    // FAQ 데이터
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
    
    // 기본 네비게이션
    { id: 'nav-1', type: 'nav', title: '시설 소개', subtitle: 'About > 시설 안내', keywords: '위치, 운영시간', url: '#/about' },
    { id: 'nav-2', type: 'nav', title: '공지사항', subtitle: 'Notice > 주요 소식', keywords: '이벤트, 휴관일', url: '#/notice' },
    { id: 'nav-3', type: 'nav', title: '마이페이지', subtitle: 'MyPage > 개인정보', keywords: '회원권', url: '#/mypage' },
];

// 헤더 검색 로직
function initHeaderSearch() {
  const searchContainer = document.getElementById('header-search');
  if (!searchContainer) return;

  const searchInput = searchContainer.querySelector('.header-search-input');
  const resultsContainer = document.getElementById('search-results');

  // 클릭 시 확장
  searchContainer.addEventListener('click', function(e) {
    this.classList.add('active');
    searchInput.focus();
  });

  // 외부 클릭 시 축소
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      if (searchInput.value.trim() === '') {
        searchContainer.classList.remove('active');
        hideResults();
      } else {
        // 값이 있지만 외부를 클릭한 경우, 결과만 숨기고 확장은 유지?
        // 현재는 결과 숨기기가 더 나은 UX
        hideResults();
      }
    }
  });

  // 검색 입력 핸들러
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
          
          // 모든 키워드가 제목, 부제목 또는 키워드 필드에 포함되어 있는지 확인
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
              el.href = item.url; // 대체 경로
              el.className = 'search-result-item';
              
              // 타입에 따른 아이콘
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

              // 클릭 핸들러
              el.addEventListener('click', (e) => {
                  e.preventDefault(); // 네비게이션 수동 처리
                  
                  // 이동
                  window.location.hash = item.url;
                  
                  // 특정 동작 처리
                  if (item.type === 'equipment') {
                      // 장비 페이지 로드 시 탭을 열기 위해 대상 ID 저장
                      sessionStorage.setItem('targetEquipmentId', item.id);
                  } else if (item.type === 'faq') {
                      // 고객센터 페이지 로드 시 아코디언을 열기 위해 대상 ID 저장
                      // CS 모듈의 숫자 ID와 일치시키기 위해 'faq-' 접두사 제거
                      const numericId = item.id.replace('faq-', '');
                      sessionStorage.setItem('targetFaqId', numericId);
                  }

                  // 검색 닫기
                  hideResults();
                  searchInput.value = '';
                  searchContainer.classList.remove('active');
              });

              resultsContainer.appendChild(el);
          });
          
          // 아이콘 재초기화
          if (window.lucide) lucide.createIcons();
      }

      resultsContainer.classList.add('show');
  }

  function hideResults() {
      if (resultsContainer) {
          resultsContainer.classList.remove('show');
          // 애니메이션을 위해 내용 지우기 지연
          setTimeout(() => {
              if(!resultsContainer.classList.contains('show')) {
                  resultsContainer.innerHTML = '';
              }
          }, 200);
      }
  }
}

// 로그인 상태에 따라 헤더를 업데이트하는 전역 함수
window.updateHeaderState = function() {
  const btn = document.querySelector('.header-mypage-btn');
  if (!btn) return;

  // 마이페이지 로직에서 사용되는 'gym_user' 확인
  const user = localStorage.getItem('gym_user');
  
  if (user) {
    // 로그인 됨: 마이페이지 표시
    btn.innerHTML = `
      <i data-lucide="user" class="header-mypage-icon"></i>
      <span class="header-mypage-text">마이페이지</span>
    `;
    // 링크 href를 마이페이지로 업데이트 (뷰는 자체적으로 처리됨)
    btn.setAttribute('href', '#/mypage');
  } else {
    // 로그아웃 됨: 로그인 표시
    btn.innerHTML = `
      <i data-lucide="log-in" class="header-mypage-icon"></i>
      <span class="header-mypage-text">로그인</span>
    `;
    // 클릭 시 마이페이지로 이동하도록 보장 (사용자가 없으면 로그인 뷰가 기본값)
    btn.setAttribute('href', '#/mypage');
  }

  // 새 콘텐츠에 대한 아이콘 재초기화
  if (window.lucide) {
    lucide.createIcons();
  }
};

// --- 전역 유틸리티 ---
window.GymUtils = {
    getHolidays: function(year) {
        const fixedHolidays = [
            { m: 0, d: 1, name: '신정' },
            { m: 2, d: 1, name: '삼일절' },
            { m: 4, d: 5, name: '어린이날' },
            { m: 5, d: 6, name: '현충일' },
            { m: 7, d: 15, name: '광복절' },
            { m: 9, d: 3, name: '개천절' },
            { m: 9, d: 9, name: '한글날' },
            { m: 11, d: 1, name: '개교기념일' }, // 12월 1일
            { m: 11, d: 25, name: '성탄절' }
        ];

        let variableHolidays = [];

        if (year === 2024) {
            variableHolidays = [
                { m: 1, d: 9, name: '설날 연휴' }, { m: 1, d: 10, name: '설날' }, { m: 1, d: 11, name: '설날 연휴' }, { m: 1, d: 12, name: '대체공휴일(설날)' },
                { m: 3, d: 10, name: '국회의원 선거일' }, // 2024년 선거일
                { m: 4, d: 6, name: '대체공휴일(어린이날)' }, // 5월 5일이 일요일 -> 5월 6일
                { m: 4, d: 15, name: '부처님 오신 날' },
                { m: 8, d: 16, name: '추석 연휴' }, { m: 8, d: 17, name: '추석' }, { m: 8, d: 18, name: '추석 연휴' }
            ];
        } else if (year === 2025) {
            variableHolidays = [
                { m: 0, d: 27, name: '임시공휴일' }, // 잠재적 징검다리? 공식 일정 따름
                { m: 0, d: 28, name: '설날 연휴' }, { m: 0, d: 29, name: '설날' }, { m: 0, d: 30, name: '설날 연휴' },
                { m: 2, d: 3, name: '대체공휴일(삼일절)' }, // 3월 1일 토요일 -> 3월 3일 월요일? (적용 시)
                { m: 4, d: 6, name: '대체공휴일(부처님오신날)' }, // 부처님오신날(5/5)과 어린이날(5/5) 겹침
                { m: 9, d: 5, name: '추석 연휴' }, { m: 9, d: 6, name: '추석' }, { m: 9, d: 7, name: '추석 연휴' }, { m: 9, d: 8, name: '대체공휴일(추석)' }
            ];
        } else if (year === 2026) {
            variableHolidays = [
                { m: 1, d: 16, name: '설날 연휴' }, { m: 1, d: 17, name: '설날' }, { m: 1, d: 18, name: '설날 연휴' },
                { m: 4, d: 24, name: '부처님 오신 날' },
                { m: 8, d: 25, name: '추석 연휴' }, { m: 8, d: 26, name: '추석' }, { m: 8, d: 27, name: '추석 연휴' }
            ];
        }

        return [...fixedHolidays, ...variableHolidays];
    },

    isClosedDay: function(year, month, day) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // 일요일
        if (dayOfWeek === 0) return true;

        // 공휴일
        const holidays = this.getHolidays(year);
        const found = holidays.find(h => h.m === month && h.d === day);
        return !!found; // 찾으면 true 반환
    },
    
    getHolidayName: function(year, month, day) {
        const holidays = this.getHolidays(year);
        const found = holidays.find(h => h.m === month && h.d === day);
        return found ? found.name : null;
    }
};