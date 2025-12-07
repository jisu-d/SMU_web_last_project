function initAbout() {
    // --- Map Initialization (Updated: Keyword Search) ---
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

        // Search for the location
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch('상명대학교 천안캠퍼스 상명스포츠센터', function(data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
                const place = data[0];
                const coords = new kakao.maps.LatLng(place.y, place.x);
                
                // Move map center
                map.setCenter(coords);
                
                // Add marker
                const marker = new kakao.maps.Marker({
                    map: map,
                    position: coords
                });

                // Add InfoWindow with Directions Link
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
                // Fallback
                const marker = new kakao.maps.Marker({
                    position: defaultCenter
                });
                marker.setMap(map);
            }
        });
    } else {
        console.error('Kakao Map script not loaded.');
    }

    // --- Calendar Initialization (New) ---
    renderCalendar();

    // --- Scroll Reveal Animation (New) ---
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before bottom
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Remove active class when scrolling out of view to reverse animation
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));
}

// Calendar Logic
function renderCalendar() {
    const wrapper = document.getElementById('calendar-wrapper');
    if (!wrapper) return;

    if (!window.GymUtils) {
        console.error("GymUtils not found!");
        return;
    }

    let currentDate = new Date(); // Start with today
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function generate() {
        // Clear wrapper
        wrapper.innerHTML = '';

        // Card structure
        const card = document.createElement('div');
        card.className = 'brand-card calendar-card';

        // Header
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

        // Grid Container
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // Weekdays
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-cell calendar-weekday';
            el.textContent = day;
            if (day === '일') el.style.color = '#F04452';
            grid.appendChild(el);
        });

        // Days
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        // Previous Month Fillers
        for (let i = 0; i < firstDayOfMonth; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-cell prev-month';
            el.textContent = daysInPrevMonth - firstDayOfMonth + 1 + i;
            grid.appendChild(el);
        }

        // Current Month Days
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
                
                // Add to list
                const dateObj = new Date(currentYear, currentMonth, day);
                const holidayName = GymUtils.getHolidayName(currentYear, currentMonth, day);
                const dayName = weekdays[dateObj.getDay()];
                const reason = holidayName ? holidayName : '정기 휴무';
                
                // Only add if it's a holiday OR Sunday (maybe group Sundays? No, list them all is safer for clarity, or just Holidays?)
                // User requirement: "Display monthly closed days". Listing all Sundays might be too long.
                // Let's list Holidays + "Every Sunday" note? 
                // Actually, a compact list of *exceptions* (Holidays) is better, but the calendar visual shows all.
                // Let's list only Holidays and "Special Closures" in the text list, as Sundays are obvious visually.
                // BUT user asked for "Month Closed Days Guide".
                // Let's list Holidays specifically. If no holidays, say "Every Sunday is closed".
                
                if (holidayName) {
                    closedList.push({ date: `${currentMonth + 1}/${day} (${dayName})`, reason: holidayName, isHoliday: true });
                }
            }

            el.textContent = day;
            grid.appendChild(el);
        }

        // Next Month Fillers
        const totalCells = firstDayOfMonth + daysInMonth;
        const nextMonthDays = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= nextMonthDays; i++) {
            const el = document.createElement('div');
            el.className = 'calendar-cell next-month';
            el.textContent = i;
            grid.appendChild(el);
        }

        card.appendChild(grid);

        // Closed Days List (Footer)
        const listContainer = document.createElement('div');
        listContainer.className = 'closed-days-list';

        // Always add a generic Sunday note
        const sundayNote = document.createElement('div');
        sundayNote.className = 'closed-day-item';
        sundayNote.innerHTML = `<span class="closed-day-date">매주 일요일</span><span class="closed-day-reason">정기 휴무</span>`;
        listContainer.appendChild(sundayNote);

        // Add specific holidays
        closedList.forEach(item => {
            const div = document.createElement('div');
            div.className = 'closed-day-item highlight';
            div.innerHTML = `<span class="closed-day-date">${item.date}</span><span class="closed-day-reason">${item.reason}</span>`;
            listContainer.appendChild(div);
        });

        // Check if scrollable needed (More than 2 items: 1 Sunday + >1 Holidays)
        if (1 + closedList.length > 2) {
            listContainer.classList.add('scrollable');
        }

        card.appendChild(listContainer);
        wrapper.appendChild(card);
        
        if(window.lucide) lucide.createIcons();
    }

    generate();
}

// Global Trainer Contact Toggle
window.toggleTrainerPhone = function(btn) {
    const container = btn.closest('.trainer-text');
    if (!container) return;

    const expEl = container.querySelector('.trainer-exp');
    const phoneEl = container.querySelector('.trainer-phone');

    if (!expEl || !phoneEl) return;

    // Toggle logic
    const isPhoneVisible = phoneEl.style.display !== 'none';

    if (isPhoneVisible) {
        // Hide Phone, Show Exp
        phoneEl.style.display = 'none';
        expEl.style.display = 'block';
        btn.classList.remove('active');
    } else {
        // Show Phone, Hide Exp
        phoneEl.style.display = 'block';
        expEl.style.display = 'none';
        btn.classList.add('active');
    }
};