window.initHome = function() {
    // Lucide 아이콘 초기화
    if (window.lucide) {
        lucide.createIcons();
    }

    // X-mas 이벤트 배너 클릭 로직
    const promoBanner = document.querySelector('.promo-banner');

    if (promoBanner) {
        promoBanner.style.cursor = 'pointer';
        promoBanner.addEventListener('click', (e) => {
            // 세션 스토리지에 쿠폰 정보 저장
            sessionStorage.setItem('pendingPayment', 'true');
            sessionStorage.setItem('pendingCoupon', 'X-mas');
            
            // 마이페이지로 이동
            window.location.href = '#/mypage';
        });
    }
};