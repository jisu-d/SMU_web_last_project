window.initHome = function() {
    // 라우터(router.js)에서 페이지 로드 후 lucide.createIcons()를 호출하므로 중복 초기화 제거

    // X-mas 쿠폰 발급 버튼 로직
    const couponBtn = document.getElementById('btn-copy-code');
    if (couponBtn) {
        couponBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 배너 클릭 이벤트(페이지 이동) 방지

            // 1. 로그인 체크
            const userJson = localStorage.getItem('gym_user');
            if (!userJson) {
                alert('로그인이 필요한 서비스입니다.\n로그인 페이지로 이동합니다.');
                window.location.href = '#/mypage';
                return;
            }

            let user = null;

            try {
                // 2. 사용자 정보 파싱 시도
                user = JSON.parse(userJson);
            } catch (e) {
                // JSON 파싱 실패 시: 구버전 데이터(단순 ID 문자열)로 간주하고 복구 시도
                console.warn("gym_user 데이터 형식이 올바르지 않아 복구를 시도합니다.", e);
                
                const userId = userJson; // 파싱 실패한 원본 문자열을 ID로 사용
                
                if (typeof MEMBERS !== 'undefined' && MEMBERS[userId]) {
                    user = MEMBERS[userId];
                    user.id = userId; // 객체에 ID 포함
                    
                    // 올바른 JSON 형식으로 스토리지 업데이트 (자동 마이그레이션)
                    localStorage.setItem('gym_user', JSON.stringify(user));
                    console.log("사용자 데이터 복구 및 스토리지 업데이트 완료");
                } else {
                    // 복구 실패
                    console.error("사용자 ID로 정보를 찾을 수 없습니다:", userId);
                    alert("회원 정보를 찾을 수 없습니다.\n다시 로그인해주세요.");
                    localStorage.removeItem('gym_user');
                    window.location.href = '#/mypage';
                    return;
                }
            }

            try {
                // 3. 쿠폰 발급 로직 실행
                
                // 쿠폰 배열 초기화 (없을 경우)
                if (!user.coupons) user.coupons = [];

                // 중복 체크
                if (user.coupons.includes('X-mas')) {
                    alert('이미 발급된 쿠폰입니다.');
                    return;
                }

                // 쿠폰 추가
                user.coupons.push('X-mas');

                // 3. 저장소 업데이트 (로그인 유지 세션)
                localStorage.setItem('gym_user', JSON.stringify(user));

                // 4. 가상 DB(MEMBERS) 동기화 (세션 내 데이터 일관성)
                // MEMBERS가 전역에 정의되어 있는지 확인
                if (typeof MEMBERS !== 'undefined') {
                    // MEMBERS 객체 순회하며 현재 유저 찾기
                    for (const id in MEMBERS) {
                        if (MEMBERS[id].contact === user.contact && MEMBERS[id].name === user.name) {
                            if (!MEMBERS[id].coupons) MEMBERS[id].coupons = [];
                            if (!MEMBERS[id].coupons.includes('X-mas')) {
                                MEMBERS[id].coupons.push('X-mas');
                            }
                            break;
                        }
                    }
                }

                alert('X-mas 쿠폰이 발급되었습니다!');
            } catch (error) {
                console.error('쿠폰 발급 중 오류 발생:', error);
                alert('오류가 발생했습니다. 다시 시도해주세요.');
            }
        });
    }

    // X-mas 이벤트 배너 클릭 로직 (기존 유지)
    const promoBanner = document.querySelector('.promo-banner');

    if (promoBanner) {
        promoBanner.style.cursor = 'pointer';
        promoBanner.addEventListener('click', (e) => {
            // 버튼 클릭이 아닐 경우에만 이동
            if (e.target.closest('#btn-copy-code')) return;

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
        script.onerror = () => {
            console.error('Failed to load notice/script.js');
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
