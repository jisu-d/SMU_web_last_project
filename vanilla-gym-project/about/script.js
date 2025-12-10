function initAbout() {
    // --- 지도 초기화 (업데이트: 키워드 검색) ---
    const container = document.getElementById('kakao-map');
    
    if (window.kakao && window.kakao.maps) {
        const defaultCenter = new kakao.maps.LatLng(36.833805, 127.179108);
        const options = {
            center: defaultCenter,
            level: 3
        };
        const map = new kakao.maps.Map(container, options);
        map.setZoomable(false); 
        map.setDraggable(false);

        // 위치 검색
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch('상명대학교 천안캠퍼스 상명스포츠센터', function(data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
                const place = data[0];
                const coords = new kakao.maps.LatLng(place.y, place.x);
                
                // 지도 중심 이동
                map.setCenter(coords);
                
                // 마커 추가
                const marker = new kakao.maps.Marker({
                    map: map,
                    position: coords
                });

                // 길찾기 링크가 포함된 인포윈도우 추가
                const infowindow = new kakao.maps.InfoWindow({
                    content: `
                        <div style="padding:15px; min-width:240px; color:#333; font-family:sans-serif;">
                            <div style="font-weight:bold; margin-bottom:5px; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${place.place_name}</div>
                            <div style="font-size:12px; color:#666; margin-bottom:10px;">${place.road_address_name || place.address_name}</div>
                            <a href="https://map.kakao.com/link/to/${place.place_name},${place.y},${place.x}" target="_blank" style="display:block; width:100%; padding:8px 0; background:#FEE500; color:#191919; text-decoration:none; font-size:13px; border-radius:6px; font-weight:bold; text-align:center;">
                                카카오맵으로 길찾기
                            </a>
                        </div>
                    `
                });
                infowindow.open(map, marker);
            } else {
                // 대체 동작
                const marker = new kakao.maps.Marker({
                    position: defaultCenter
                });
                marker.setMap(map);
            }
        });
    } else {
        console.error('Kakao Map script not loaded.');
    }

    // --- 캘린더 초기화 (신규) ---
    renderCalendar();

    // --- 스크롤 등장 애니메이션 (신규) ---
    const observerOptions = {
        threshold: 0.15, // 요소의 15%가 보일 때 트리거
        rootMargin: "0px 0px -50px 0px" // 하단보다 약간 앞에서 트리거
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // 뷰에서 벗어날 때 active 클래스를 제거하여 애니메이션 역재생 (선택 사항)
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));
}

// 캘린더 로직
function renderCalendar() {
    const wrapper = document.getElementById('calendar-wrapper');
    if (!wrapper) return;

    if (!window.GymUtils) {
        console.error("GymUtils not found!");
        return;
    }

    let currentDate = new Date(); // 오늘 날짜로 시작
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function generate() {
        // 래퍼 초기화
        wrapper.innerHTML = '';

        // 카드 구조
        const card = document.createElement('div');
        card.className = 'brand-card calendar-card';

        // 헤더
        const header = document.createElement('div');
        header.className = 'calendar-header';
        
        const title = document.createElement('div');
        title.className = 'calendar-title';
        title.textContent = `${currentYear}년 ${currentMonth + 1}월`;

        const nav = document.createElement('div');
        nav.className = 'calendar-nav';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'calendar-nav-btn';
        prevBtn.innerHTML = '<i data-lucide="chevron-left"></i>';
        prevBtn.onclick = () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generate();
        };

        const nextBtn = document.createElement('button');
        nextBtn.className = 'calendar-nav-btn';
        nextBtn.innerHTML = '<i data-lucide="chevron-right"></i>';
        nextBtn.onclick = () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generate();
        };

        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        header.appendChild(title);
        header.appendChild(nav);
        card.appendChild(header);

        // 그리드 컨테이너
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // 요일
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-cell calendar-weekday';
            el.textContent = day;
            if (day === '일') el.style.color = '#F04452';
            grid.appendChild(el);
        });

        // 날짜
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        // 이전 달 채우기
        for (let i = 0; i < firstDayOfMonth; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-cell prev-month';
            el.textContent = daysInPrevMonth - firstDayOfMonth + 1 + i;
            grid.appendChild(el);
        }

        // 현재 달 날짜
        const today = new Date();
        const closedList = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const el = document.createElement('div');
            el.className = 'calendar-cell';
            
            const isToday = (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear());
            if (isToday) el.classList.add('today');

            const isClosed = GymUtils.isClosedDay(currentYear, currentMonth, day);
            if (isClosed) {
                el.classList.add('closed');
                
                // 목록에 추가
                const dateObj = new Date(currentYear, currentMonth, day);
                const holidayName = GymUtils.getHolidayName(currentYear, currentMonth, day);
                const dayName = weekdays[dateObj.getDay()];
                const reason = holidayName ? holidayName : '정기 휴무';
                
                // 휴무일 목록에는 공휴일만 표시 (일요일은 하단 고정 텍스트로 처리)
                if (holidayName) {
                    closedList.push({ date: `${currentMonth + 1}/${day} (${dayName})`, reason: holidayName, isHoliday: true });
                }
            }

            el.textContent = day;
            grid.appendChild(el);
        }

        // 다음 달 채우기
        const totalCells = firstDayOfMonth + daysInMonth;
        const nextMonthDays = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= nextMonthDays; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-cell next-month';
            el.textContent = i;
            grid.appendChild(el);
        }

        card.appendChild(grid);

        // 휴무일 목록 (푸터)
        const listContainer = document.createElement('div');
        listContainer.className = 'closed-days-list';

        // 일요일 휴무 안내는 항상 추가
        const sundayNote = document.createElement('div');
        sundayNote.className = 'closed-day-item';
        sundayNote.innerHTML = `<span class="closed-day-date">매주 일요일</span><span class="closed-day-reason">정기 휴무</span>`;
        listContainer.appendChild(sundayNote);

        // 특정 공휴일 추가
        closedList.forEach(item => {
            const div = document.createElement('div');
            div.className = 'closed-day-item highlight';
            div.innerHTML = `<span class="closed-day-date">${item.date}</span><span class="closed-day-reason">${item.reason}</span>`;
            listContainer.appendChild(div);
        });

        // 스크롤 필요 여부 확인 (2개 초과: 1 일요일 + >1 공휴일)
        if (1 + closedList.length > 2) {
            listContainer.classList.add('scrollable');
        }

        card.appendChild(listContainer);
        wrapper.appendChild(card);
        
        if(window.lucide) lucide.createIcons();
    }

    generate();
}

// 전역 트레이너 연락처 토글 함수
window.toggleTrainerPhone = function(btn) {
    const container = btn.closest('.trainer-text');
    if (!container) return;

    const expEl = container.querySelector('.trainer-exp');
    const phoneEl = container.querySelector('.trainer-phone');

    if (!expEl || !phoneEl) return;

    // 토글 로직
    const isPhoneVisible = phoneEl.style.display !== 'none';

    if (isPhoneVisible) {
        // 전화번호 숨기기, 경력 표시
        phoneEl.style.display = 'none';
        expEl.style.display = 'block';
        btn.classList.remove('active');
    } else {
        // 전화번호 표시, 경력 숨기기
        phoneEl.style.display = 'block';
        expEl.style.display = 'none';
        btn.classList.add('active');
    }
};