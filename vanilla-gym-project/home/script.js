window.initHome = function() {
    // 라우터(router.js)에서 페이지 로드 후 lucide.createIcons()를 호출하므로 중복 초기화 제거

    // X-mas 이벤트 배너 클릭 로직
    const promoBanner = document.querySelector('.promo-banner');

    if (promoBanner) {
        promoBanner.style.cursor = 'pointer';
        promoBanner.addEventListener('click', (e) => {
            // 세션 스토리지에 쿠폰 정보 저장
            sessionStorage.setItem('pendingPayment', 'true');
            sessionStorage.setItem('pendingCoupon', 'X-mas');

            window.location.href = '#/mypage';
        });
    }

    // 커뮤니티 업데이트 섹션 (공지사항 스크립트 연결)
    if (window.renderCommunityUpdates) {
        window.renderCommunityUpdates('home-community-list', 3); 
    } else {
        // notice/script.js가 로드되지 않았을 경우 동적으로 로드
        const script = document.createElement('script');
        script.src = 'notice/script.js';
        script.onload = () => {
            if (window.renderCommunityUpdates) {
                window.renderCommunityUpdates('home-community-list', 3);
            }
        };
        document.head.appendChild(script);
    }

    // --- 스크롤 등장을 위한 관찰자(Observer) 설정 ---
    const observerOptions = {
        threshold: 0.1, // 요소가 10% 보일 때 트리거
        rootMargin: "0px 0px -30px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // .scroll-reveal 클래스를 가진 요소 관찰
    setTimeout(() => {
        const revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(el => observer.observe(el));
    }, 100); // DOM이 완전히 준비될 때까지 약간의 지연
};