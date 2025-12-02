window.initCustomerService = function() {
    // 1. FAQ Data Definition
    const faqs = [
        { id: 1, category: '등록', question: '회원 등록은 어떻게 하나요?', answer: "회원 등록은 헬스장 방문 또는 온라인으로 가능합니다. 온라인 등록을 원하시면 '마이페이지'에서 결제하기 버튼을 클릭하여 진행하실 수 있습니다. 방문 등록을 원하시면 신분증을 지참하여 헬스장으로 방문해 주세요." },
        { id: 2, category: '운영', question: '운영 시간이 어떻게 되나요?', answer: "평일(월-금)은 오전 6시부터 오후 11시까지 운영합니다. 토요일은 오전 9시부터 오후 6시까지 운영하며, 일요일 및 공휴일은 휴무입니다. 자세한 휴무일은 '소개' 페이지의 달력에서 확인하실 수 있습니다." },
        { id: 3, category: '요금', question: '이용 요금은 얼마인가요?', answer: "1개월 기준 10,000원이며, 3개월 이상 등록 시 할인 혜택이 있습니다. 3개월은 29,000원, 5개월은 49,000원, 12개월은 116,000원입니다. 현재 크리스마스 이벤트로 쿠폰 코드 'X-mas' 입력 시 추가 20% 할인을 받으실 수 있습니다." },
        { id: 4, category: '환불', question: '환불 규정이 어떻게 되나요?', answer: "회원권 환불은 등록일로부터 7일 이내, 미사용 시에만 전액 환불이 가능합니다. 7일 경과 후에는 사용 기간을 제외한 잔여 기간에 대해 10% 위약금을 공제 후 환불해 드립니다. 할인 적용 시 정상가 기준으로 계산됩니다." },
        { id: 5, category: 'PT', question: 'PT(개인 트레이닝)는 별도인가요?', answer: "네, PT는 회원권과 별도로 운영됩니다. 1회당 50,000원이며, 10회권은 450,000원, 20회권은 850,000원입니다. 신규 회원의 경우 첫 PT 1회를 무료로 제공해 드립니다. PT 예약은 전화 또는 방문하여 진행하실 수 있습니다." },
        { id: 6, category: '시설', question: '사물함은 어떻게 이용하나요?', answer: "사물함은 회원 등록 시 자동으로 배정되며, 개인 비밀번호를 설정하실 수 있습니다. 비밀번호는 마이페이지에서 확인 가능합니다. 사물함 비밀번호 분실 시 신분증을 지참하여 관리자에게 문의해 주세요." },
        // New FAQs
        { id: 7, category: '시설', question: '운동복이나 수건을 대여할 수 있나요?', answer: "신규 회원에게는 운동복 1벌과 수건을 무료로 제공해 드립니다. 추가 대여를 원하시는 경우 운동복은 1회 3,000원, 수건은 1회 1,000원입니다." },
        { id: 8, category: '시설', question: '샤워 시설은 있나요?', answer: "네, 남녀 구분된 샤워실과 탈의실이 완비되어 있습니다. 샤워실에는 샴푸, 바디워시 등 기본 용품이 비치되어 있으며, 드라이기도 제공됩니다." },
        { id: 9, category: '운동', question: '초보자인데 운동 방법을 배울 수 있나요?', answer: "네, 신규 회원을 대상으로 기구 사용법 무료 교육을 진행하고 있습니다. 또한 웹사이트의 '운동안내' 페이지에서 영상 가이드를 확인하실 수 있습니다." },
        { id: 10, category: '편의', question: '주차는 가능한가요?', answer: "건물 지하 주차장을 이용하실 수 있습니다. 회원의 경우 2시간 무료 주차가 제공되며, 추가 시간은 30분당 1,000원입니다." },
        { id: 11, category: '안전', question: '코로나19 방역은 어떻게 진행되나요?', answer: "매일 2회 이상 전체 소독을 실시하며, 곳곳에 손 소독제가 비치되어 있습니다. 공기청정기도 24시간 가동 중입니다." },
        { id: 12, category: '요금', question: '일일권이나 체험권이 있나요?', answer: "1일 체험권은 5,000원이며, 처음 방문하시는 분에 한해 1회 이용 가능합니다." },
        { id: 13, category: '등록', question: '미성년자도 등록 가능한가요?', answer: "만 14세 이상부터 등록 가능하며, 만 19세 미만의 경우 보호자 동의서가 필요합니다." },
        { id: 14, category: '운영', question: '공휴일 운영 시간은 어떻게 되나요?', answer: "공휴일은 원칙적으로 휴무이나, 대체 공휴일 등의 경우 단축 운영(10:00-18:00)할 수 있습니다. 공지사항을 참고해주세요." },
        { id: 15, category: 'PT', question: 'PT 선생님을 지정할 수 있나요?', answer: "네, 상담 시 원하시는 트레이너를 지정하거나, 운동 목적에 맞는 트레이너를 추천받으실 수 있습니다." },
        { id: 16, category: '시설', question: '와이파이 사용이 가능한가요?', answer: "네, 헬스장 내 어디서든 무료 와이파이를 이용하실 수 있습니다. 비밀번호는 안내 데스크에 문의해주세요." },
        { id: 17, category: '환불', question: '장기 정지(홀딩)가 가능한가요?', answer: "3개월 이상 회원권 등록 시, 부상이나 출장 등 증빙 서류 제출 시 최대 30일까지 이용 정지가 가능합니다." },
        { id: 18, category: '운동', question: 'GX 프로그램도 있나요?', answer: "현재 요가와 필라테스 수업을 준비 중이며, 추후 개설 시 공지사항을 통해 안내드릴 예정입니다." },
        { id: 19, category: '편의', question: '운동 중 물을 마실 수 있는 정수기가 있나요?', answer: "네, 유산소존과 웨이트존 입구에 정수기가 설치되어 있습니다. 개인 물통을 지참하시면 더욱 편리합니다." },
        { id: 20, category: '안전', question: '부상 시 응급처치가 가능한가요?', answer: "네, 응급처치 자격증을 보유한 트레이너가 상주하고 있으며, 기본 구급약품과 제세동기(AED)가 비치되어 있습니다." }
    ];

    // DOM Elements
    const categoryButtons = document.querySelectorAll('.cs-category-btn');
    const listContainer = document.querySelector('.cs-faq-list');
    const searchInput = document.getElementById('cs-search-input');
    const paginationContainer = document.getElementById('cs-pagination');
    
    // State
    let currentCategory = '전체';
    const itemsPerPage = 5; // Increased from 4 to see more items
    let currentPage = 1;
    let activeFaqId = null;

    // Render Pagination Controls
    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'cs-page-btn';
        prevBtn.textContent = '<';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderList();
                window.scrollTo(0, 0);
            }
        };
        paginationContainer.appendChild(prevBtn);

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `cs-page-btn ${currentPage === i ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderList();
                window.scrollTo(0, 0);
            };
            paginationContainer.appendChild(pageBtn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'cs-page-btn';
        nextBtn.textContent = '>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderList();
                window.scrollTo(0, 0);
            }
        };
        paginationContainer.appendChild(nextBtn);
    }

    // Render Filtered & Paginated List
    function renderList() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        // 1. Filter
        const filteredItems = faqs.filter(item => {
            const matchCategory = currentCategory === '전체' || item.category === currentCategory;
            const matchSearch = item.question.toLowerCase().includes(searchTerm);
            return matchCategory && matchSearch;
        });

        // 2. Pagination Calculation
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

        // 3. Generate HTML
        if (listContainer) {
            listContainer.innerHTML = '';
            
            if (paginatedItems.length === 0) {
                listContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: #6b7280;">검색 결과가 없습니다.</div>';
            } else {
                paginatedItems.forEach(item => {
                    const faqEl = document.createElement('div');
                    faqEl.className = `cs-faq-item ${activeFaqId === item.id ? 'active' : ''}`;
                    faqEl.setAttribute('data-id', item.id);
                    
                    faqEl.innerHTML = `
                        <button class="cs-faq-question-btn">
                            <div class="cs-faq-question-content">
                                <span class="cs-q-badge">Q</span>
                                <div class="cs-question-wrapper">
                                    <div class="cs-category-tag-wrapper">
                                        <span class="cs-category-tag">${item.category}</span>
                                    </div>
                                    <h3 class="cs-question-text">${item.question}</h3>
                                </div>
                            </div>
                            <i data-lucide="chevron-down" class="cs-chevron-icon"></i>
                        </button>
                        <div class="cs-faq-answer">
                            <div class="cs-answer-content">
                                <span class="cs-a-badge">A</span>
                                <p class="cs-answer-text">${item.answer}</p>
                            </div>
                        </div>
                    `;

                    // Add Click Listener for Accordion
                    const btn = faqEl.querySelector('.cs-faq-question-btn');
                    btn.addEventListener('click', () => {
                        if (activeFaqId === item.id) {
                            activeFaqId = null;
                            faqEl.classList.remove('active');
                        } else {
                            // Optional: Close others
                            const currentActive = listContainer.querySelector('.cs-faq-item.active');
                            if (currentActive) currentActive.classList.remove('active');
                            
                            activeFaqId = item.id;
                            faqEl.classList.add('active');
                        }
                    });

                    listContainer.appendChild(faqEl);
                });
            }
        }

        // 4. Render Pagination & Refresh Icons
        renderPagination(totalPages);
        if (window.lucide) lucide.createIcons();
    }

    // Debounce Helper
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Event Listeners - Category
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.getAttribute('data-category');
            currentPage = 1;
            activeFaqId = null; // Reset open accordion
            renderList();
        });
    });

    // Event Listeners - Search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentPage = 1;
            activeFaqId = null;
            renderList();
        }, 500));
    }

    // Initial Render
    renderList();
};
