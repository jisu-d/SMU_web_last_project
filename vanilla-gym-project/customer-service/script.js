window.initCustomerService = function() {
    // 1. FAQ Data Definition
    const faqs = [
        { 
            id: 1, 
            category: '등록', 
            question: '헬스장 어디가 좋아요?', 
            answer: "무조건 가까운 곳이 제일 좋습니다. 저는 헬스장을 먼저 골라놓고 그 근처에 있는 집을 구했어요. 여러분의 의지는 유한하다는 것을 꼭 기억하세요." 
        },
        { 
            id: 2, 
            category: 'PT', 
            question: 'PT 어떻게 골라요?', 
            answer: "체육학, 체육지도학 등 관련 학문의 학사 이상 학력을 가진 사람 중 본인과 성별, 체형이 비슷한 사람을 고르세요. 체형이 비슷해야 노하우를 배우기 좋습니다. 자격증은 국가공인 자격증인 '건강운동관리사'와 '(전문·생활) 스포츠지도사' 외에는 볼만한 것이 없다고 보시면 됩니다." 
        },
        { 
            id: 3, 
            category: '장비', 
            question: '특정 부위가 아픈데 보호대 사요?', 
            answer: "보호대도 사고 자세도 바꾸세요. 좋지 않은 자세에서 오는 통증을 보호대로 억누르면 결국 부상당합니다. 자세가 좋은데 아프다면 병원에 가세요." 
        },
        { 
            id: 4, 
            category: '장비', 
            question: '스트랩 뭐 사요? 베르사 그립 사요?', 
            answer: "악력 보조 장비는 그립, 후크, 줄 스트랩, 8자 스트랩 등 다양합니다. 보급형으로 먼저 써보고 잘 맞는 종류의 고급품을 사시는 것이 좋습니다.\n\n또한 스트랩을 쓰더라도 악력 훈련을 병행해야 합니다. 악력 훈련 없이 성장하다가 스트랩으로도 커버 안 되는 구간에 도달하면 긴 정체기를 겪을 수 있습니다." 
        },
        { 
            id: 5, 
            category: '장비', 
            question: '벨트 뭐가 좋아요?', 
            answer: "벨크로, 프롱, 레버 등 다양한 종류가 있습니다. 초보자가 SBD 레버벨트 사봤자 당근마켓으로 갈 확률이 높으니 보급품(추천: VALEO)부터 시작하세요.\n\n구매 전 복압 잡는 법(브레이싱)을 먼저 숙달하세요. 복압을 제대로 잡으면 벨트 없이도 체중 2~3배의 무게를 다룰 수 있습니다. (추천 운동: 데드버그)" 
        },
        { 
            id: 6, 
            category: '운동', 
            question: '유산소랑 무산소 중에 뭐가 좋아요?', 
            answer: "균형 잡힌 성장과 부상 방지 등 여러 긍정적인 효과를 위해서는 둘 다 하는 것이 제일 좋습니다." 
        },
        { 
            id: 7, 
            category: '운동', 
            question: '정체기 왔는데 어떻게 뚫어요?', 
            answer: "횟수 위주로 했다면 중량을, 중량 위주로 했다면 횟수를 늘려보세요. 근육의 지근(내구도)과 속근(순발력)을 고르게 발달시켜야 퍼포먼스가 좋아집니다." 
        },
        { 
            id: 8, 
            category: '운동', 
            question: '운동 루틴 어떻게 짜요?', 
            answer: "아무 운동 앱이나 깔아서 전문가들이 만든 검증된 프로그램을 해보세요. 한 바퀴씩 돌려보고 잘 맞는 프로그램으로 3달, 6달 지속하면 달라진 몸을 만날 수 있을 겁니다." 
        },
        { 
            id: 9, 
            category: '식단', 
            question: '보충제 꼭 먹어야 해요?', 
            answer: "안 먹어도 됩니다. 보충제는 말 그대로 보충을 위한 것이며 마법 같은 효과는 없습니다. 고기와 채소 등 일반적인 식품을 통해서 영양소를 섭취하는 것이 가장 추천할 만한 방법입니다." 
        },
        { 
            id: 10, 
            category: '식단', 
            question: '닭가슴살 맛없는데 다른 건 없나요?', 
            answer: "돼지, 소 등 살코기가 많은 고기를 먹으면 됩니다. 생선을 좋아한다면 생선도 좋고, 요즘은 순살 생선 전문 브랜드(씨몬스터 등)도 많으니 식탁을 풍성하게 차려봅시다." 
        },
        { 
            id: 11, 
            category: '식단', 
            question: '마카? 아르기닌? 좋은 건가요?', 
            answer: "현재까지 과학적으로 운동능력 향상 효과가 입증된 보충제는 카페인, 크레아틴, 베타알라닌 정도입니다. 섭취 여부는 의사·약사 등 전문가와 상담해보시는 것이 좋습니다." 
        }
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
