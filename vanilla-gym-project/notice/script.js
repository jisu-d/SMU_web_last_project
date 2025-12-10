const notices = [
    {
        id: 1,
        title: "12월 정기 회원 모집 안내",
        content: `안녕하세요, K동 헬스장입니다.

2024년 12월 정기 회원을 모집합니다.

[모집 기간]
- 2024년 12월 1일 ~ 12월 15일

[모집 인원]
- 선착순 50명

[등록 혜택]
- 1개월 무료 PT 1회 제공
- 헬스 기구 사용법 무료 교육
- 운동복 및 수건 무료 제공

많은 관심 부탁드립니다.

문의: 02-1234-5678`,
        author: "관리자",
        date: "2025-12-01",
        views: 245,
        category: "모집",
    },
    {
        id: 2,
        title: "🎄 크리스마스 특별 할인 이벤트",
        content: `크리스마스를 맞아 특별 할인 이벤트를 진행합니다!

[이벤트 내용]
- 쿠폰 코드: X-mas
- 할인율: 20%
- 적용 기간: 2025년 12월 1일 ~ 12월 25일

[적용 방법]
마이페이지 > 결제하기 > 쿠폰 입력란에 "X-mas" 입력

※ 다른 할인과 중복 적용 가능
※ 신규 회원 및 기존 회원 모두 사용 가능

행복한 연말 보내세요!`,
        author: "관리자",
        date: "2025-12-01",
        views: 389,
        category: "이벤트",
    },
    {
        id: 3,
        title: "12월 휴무일 안내",
        content: `12월 휴무일을 안내드립니다.

[정기 휴무]
- 매주 일요일

[특별 휴무]
- 12월 25일 (크리스마스)

※ 토요일은 오후 6시까지만 운영합니다.

이용에 참고 부탁드립니다.`,
        author: "관리자",
        date: "2025-11-28",
        views: 156,
        category: "공지",
    },
    {
        id: 4,
        title: "운동 기구 사용 안전 수칙",
        content: `회원 여러분의 안전한 운동을 위해 기구 사용 안전 수칙을 안내드립니다.

[안전 수칙]
1. 운동 전 반드시 스트레칭을 실시하세요.
2. 본인의 체력에 맞는 무게로 시작하세요.
3. 운동 기구 사용법을 숙지한 후 사용하세요.
4. 운동 중 이상 증상 발생 시 즉시 중단하세요.
5. 기구 사용 후 제자리에 정리해 주세요.

※ 기구 사용법이 궁금하시면 언제든 트레이너에게 문의하세요.

안전한 운동 문화를 만들어갑시다.`,
        author: "관리자",
        date: "2025-11-25",
        views: 201,
        category: "공지",
    },
    {
        id: 5,
        title: "신규 운동 기구 도입 안내",
        content: `회원 여러분께 반가운 소식을 전합니다.

12월부터 신규 운동 기구가 도입됩니다!

[도입 기구]
- 최신형 러닝머신 5대
- 스미스 머신 2대
- 케이블 크로스오버 머신 1대

기존 기구보다 더 안전하고 효과적인 운동이 가능합니다.

많은 이용 부탁드립니다!`,
        author: "관리자",
        date: "2025-11-20",
        views: 312,
        category: "공지",
    },
    {
        id: 6,
        title: "개인 사물함 자진 신고 및 정리 기간 안내",
        content: `안녕하세요. K동 헬스장입니다.

쾌적한 탈의실 환경 조성을 위해 장기간 방치된 개인 사물함을 정리하고자 합니다.
현재 사용 중인 회원님께서는 아래 기간 내에 사물함에 부착된 스티커에 성함과 사용 기간을 기재해 주시기 바랍니다.

[자진 신고 기간]
- 2024년 12월 1일 ~ 12월 15일

[정리 대상]
- 신고 기간 내 스티커가 부착되지 않은 사물함
- 사용 기간이 만료된 사물함

[조치 사항]
- 신고 기간 이후 무단 점유 사물함은 강제 개방 후 물품을 별도 보관할 예정입니다. (보관 기간 2주 후 폐기)

회원 여러분의 협조 부탁드립니다.`,
        author: "관리자",
        date: "2025-11-15",
        views: 405,
        category: "공지",
    },
    {
        id: 7,
        title: "샤워실 온수 공급 중단 안내 (12/20 02:00~04:00)",
        content: `시설 보수 공사로 인해 아래 시간 동안 샤워실 온수 공급이 일시 중단됩니다.

[중단 일시]
- 2025년 12월 20일 (토) 새벽 02:00 ~ 04:00 (2시간)

[중단 사유]
- 온수 보일러 노후 부품 교체

[이용 제한]
- 해당 시간에는 찬물만 사용 가능합니다.
- 운동 공간은 정상 이용 가능합니다.

이용에 불편을 드려 죄송합니다.`,
        author: "관리자",
        date: "2025-11-12",
        views: 188,
        category: "공지",
    },
    {
        id: 8,
        title: "새해 맞이 '바디 챌린지' 참가자 모집",
        content: `2026년 새해, 새로운 몸으로 태어나세요!
제 5회 바디 챌린지 참가자를 모집합니다.

[챌린지 기간]
- 2026년 1월 1일 ~ 3월 31일 (3개월)

[참가 자격]
- K동 헬스장 3개월 이상 등록 회원

[시상 내역]
- 1등 (1명): 상금 100만원 + PT 30회
- 2등 (1명): 상금 50만원 + PT 10회
- 3등 (2명): 헬스장 6개월 이용권

[신청 방법]
- 인포데스크 방문 신청

당신의 도전을 응원합니다!`,
        author: "관리자",
        date: "2025-11-10",
        views: 520,
        category: "이벤트",
    },
];

window.findNoticeById = function(id) {
    return notices.find(notice => notice.id === id);
};

// 카테고리 클래스를 가져오는 헬퍼 (전역)
function getCategoryClass(category) {
    switch (category) {
        case "모집": return "recruitment";
        case "이벤트": return "event";
        default: return "announcement";
    }
}

// 상세 정보 표시 (외부 호출을 위해 전역으로 설정)
window.showNoticeDetail = function(notice) {
    const listView = document.getElementById('notice-list-view');
    const detailView = document.getElementById('notice-detail-view');
    
    if (!listView || !detailView) {
        console.error("Notice views not found for showNoticeDetail.");
        return;
    }

    document.getElementById('detail-title').textContent = notice.title;
    document.getElementById('detail-author').textContent = notice.author;
    document.getElementById('detail-date').textContent = notice.date;
    document.getElementById('detail-views').textContent = notice.views;
    document.getElementById('detail-content').innerText = notice.content; // 줄바꿈 보존

    const badge = document.getElementById('detail-category-badge');
    badge.textContent = notice.category;
    badge.className = `notice-badge ${getCategoryClass(notice.category)}`;

    listView.classList.remove('active');
    detailView.classList.add('active');

    if (window.lucide) lucide.createIcons(); // 새로 표시된 콘텐츠를 위해 아이콘 재생성
};
    
// 메인 페이지의 커뮤니티 섹션용 공지사항 렌더링
window.renderCommunityUpdates = function(containerId, limit = 3) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found for community updates.`);
        return;
    }

    container.innerHTML = ''; // 기존 콘텐츠 지우기

    notices.slice(0, limit).forEach(notice => {
        const item = document.createElement('div');
        item.className = 'comm-item';
        item.innerHTML = `
            <span class="comm-badge ${getCategoryClass(notice.category)}">${notice.category}</span>
            <span class="comm-title">${notice.title}</span>
            <span class="comm-date">${notice.date}</span>
        `;
        item.style.cursor = 'pointer'; // 클릭 가능함을 표시

        item.addEventListener('click', () => {
            sessionStorage.setItem('targetNoticeId', notice.id);
            window.location.hash = '#/notice';
        });
        container.appendChild(item);
    });

    if (window.lucide) lucide.createIcons();
};

window.initNotice = function() {
    const listView = document.getElementById('notice-list-view');
    const detailView = document.getElementById('notice-detail-view');
    const listBody = document.getElementById('notice-list-body');
    const backBtn = document.getElementById('back-to-list-btn');

    // 특정 공지사항을 표시해야 하는지 확인
    const targetNoticeId = sessionStorage.getItem('targetNoticeId');
    if (targetNoticeId) {
        const notice = window.findNoticeById(parseInt(targetNoticeId));
        if (notice) {
            window.showNoticeDetail(notice);
            // 표시 후, 사용자가 뒤로 갈 경우를 대비해 목록을 백그라운드에서 렌더링
            renderList();
        } else {
            console.error(`Notice with ID ${targetNoticeId} not found.`);
            renderList(); // 찾을 수 없으면 목록 뷰로 폴백
        }
        sessionStorage.removeItem('targetNoticeId'); // 사용 후 삭제
    } else {
        // 기본 동작: 목록 렌더링
        renderList();
    }

    // 목록으로 돌아가기
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            detailView.classList.remove('active');
            listView.classList.add('active');
            renderList(); // 필요한 경우 목록이 새로고침되도록 보장
        });
    }

    // 목록 렌더링 (initNotice 로컬 함수, 메인 공지사항 페이지용)
    function renderList() {
        if (!listBody) return;
        listBody.innerHTML = '';
        notices.forEach(notice => {
            const item = document.createElement('button');
            item.className = 'notice-item';
            item.innerHTML = `
                <div class="notice-table-row">
                    <div class="notice-table-cell center">
                        <span class="notice-number">${notice.id}</span>
                    </div>
                    <div class="notice-table-cell">
                        <span class="notice-badge ${getCategoryClass(notice.category)}">
                            ${notice.category}
                        </span>
                    </div>
                    <div class="notice-table-cell">${notice.title}</div>
                    <div class="notice-table-cell">
                        <span class="notice-date">${notice.date}</span>
                    </div>
                    <div class="notice-table-cell center">
                        <span class="notice-views">
                            <i data-lucide="eye" class="notice-view-icon"></i>
                            ${notice.views}
                        </span>
                    </div>
                </div>
            `;
            item.addEventListener('click', () => window.showNoticeDetail(notice));
            listBody.appendChild(item);
        });
        if (window.lucide) lucide.createIcons();
    }
};