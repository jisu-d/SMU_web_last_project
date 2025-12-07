function initReservation() {
    // --- State Management (Local Storage) ---
    const userKey = 'gym_user';
    const dataKey = 'gym_data';

    // Helper to get data
    function getGymData() {
        const defaultData = {
            membershipExpire: null, 
            ptCount: 0,
            reservations: [] 
        };
        const stored = localStorage.getItem(dataKey);
        return stored ? JSON.parse(stored) : defaultData;
    }

    function saveGymData(data) {
        localStorage.setItem(dataKey, JSON.stringify(data));
    }

    // --- Access Control ---
    const currentUser = localStorage.getItem(userKey);
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.hash = '#/mypage'; // Redirect to login
        return; // Stop initialization
    }

    const currentData = getGymData();
    if (currentData.ptCount <= 0) {
        alert('PT 이용권이 없습니다.\n이용권 구매 페이지로 이동합니다.');
        window.location.hash = '#/mypage';
        return; 
    }

    // --- Data ---
    // Hierarchical Schedule Data: Weekly Patterns + Exceptions
    const trainerSchedules = {
        // 1. 엄희수 (성실형: 주 6일, 아침~저녁)
        1: {
            weekly: {
                1: { start: '06:00', end: '15:00', break: ['12:00'] }, // 월
                2: { start: '06:00', end: '15:00', break: ['12:00'] }, // 화
                3: { start: '06:00', end: '15:00', break: ['12:00'] }, // 수
                4: { start: '06:00', end: '15:00', break: ['12:00'] }, // 목
                5: { start: '06:00', end: '15:00', break: ['12:00'] }, // 금
                6: { start: '09:00', end: '13:00', break: [] },        // 토
                0: null // 일 (휴무)
            },
            exceptions: {
                '2024-12-25': null, // 크리스마스 휴무
                '2024-12-31': { start: '09:00', end: '12:00', break: [] } // 단축 근무
            }
        },
        // 2. 강건우 (직장인 타겟: 오후~밤)
        2: {
            weekly: {
                1: { start: '13:00', end: '22:00', break: ['17:00'] },
                2: { start: '13:00', end: '22:00', break: ['17:00'] },
                3: { start: '13:00', end: '22:00', break: ['17:00'] },
                4: { start: '13:00', end: '22:00', break: ['17:00'] },
                5: { start: '13:00', end: '22:00', break: ['17:00'] },
                6: null, // 토 (휴무)
                0: { start: '10:00', end: '18:00', break: ['13:00'] } // 일 (주말 근무)
            },
            exceptions: {}
        },
        // 3. 최영우 (재활: 평일 집중)
        3: {
            weekly: {
                1: { start: '09:00', end: '18:00', break: ['13:00'] },
                2: { start: '09:00', end: '18:00', break: ['13:00'] },
                3: { start: '09:00', end: '18:00', break: ['13:00'] },
                4: { start: '09:00', end: '18:00', break: ['13:00'] },
                5: { start: '09:00', end: '18:00', break: ['13:00'] },
                6: { start: '10:00', end: '14:00', break: [] },
                0: null
            },
            exceptions: {
                '2024-12-25': null
            }
        },
        // 4. 임지수 (파트타임)
        4: {
            weekly: {
                1: { start: '18:00', end: '22:00', break: [] },
                2: null,
                3: { start: '18:00', end: '22:00', break: [] },
                4: null,
                5: { start: '18:00', end: '22:00', break: [] },
                6: { start: '10:00', end: '18:00', break: ['13:00'] },
                0: { start: '10:00', end: '18:00', break: ['13:00'] }
            },
            exceptions: {}
        }
    };

    // Hardcoded booked slots
    const hardcodedBookedSlots = {
        '1': { // 엄희수 트레이너
            '2024-12-09': ['10:00', '14:00'], // 예시: 12월 9일 10시, 14시 예약됨
            '2024-12-10': ['09:00', '11:00']
        },
        '2': { // 강건우 트레이너
            '2024-12-15': ['13:00'],
            '2024-12-16': ['17:00', '18:00']
        },
        '3': { // 최영우 트레이너
            '2024-12-05': ['15:00']
        },
        '4': { // 임지수 트레이너
            '2024-12-06': ['10:00']
        }
    };

    const trainers = [
        { id: 1, name: '엄희수', role: '소프트웨어', img: 'img/1.png' },
        { id: 2, name: '강건우', role: '다이어트', img: 'img/2.png' },
        { id: 3, name: '최영우', role: '재활/교정', img: 'img/3.png' },
        { id: 4, name: '임지수', role: '소프트웨어', img: 'img/4.png' }
    ];

    // Helper: Generate slots based on schedule
    function getAvailableSlots(trainerId, dateStr) {
        const schedule = trainerSchedules[trainerId];
        if (!schedule) return [];

        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay(); // 0:Sun ~ 6:Sat

        // 1. Check Exceptions first
        let dayConfig = null;
        if (schedule.exceptions && schedule.exceptions[dateStr] !== undefined) {
            dayConfig = schedule.exceptions[dateStr];
        } else {
            // 2. Fallback to Weekly
            dayConfig = schedule.weekly[dayOfWeek];
        }

        if (!dayConfig) return []; // Off day

        // Generate slots from start to end
        const slots = [];
        let current = parseInt(dayConfig.start.split(':')[0]);
        const end = parseInt(dayConfig.end.split(':')[0]);

        while (current < end) {
            const timeStr = String(current).padStart(2, '0') + ':00';
            // Exclude break times
            if (!dayConfig.break.includes(timeStr)) {
                slots.push(timeStr);
            }
            current++;
        }

        return slots;
    }

    // --- State ---
    let state = {
        selectedTrainer: null,
        selectedDate: null,
        selectedTime: null,
        viewMonthIndex: 0
    };

    // --- DOM Elements ---
    const trainerListEl = document.getElementById('trainer-list');
    const dateListEl = document.getElementById('date-list');
    const timeListEl = document.getElementById('time-list');
    const monthTabsEl = document.getElementById('month-tabs');
    
    const dateSection = document.getElementById('date-section');
    const timeSection = document.getElementById('time-section');
    
    const bottomBar = document.getElementById('bottom-bar');
    const summaryText = document.getElementById('summary-text');
    const confirmBtn = document.getElementById('res-confirm-btn');

    // --- Render Functions ---

    function renderTrainers() {
        // If list is empty, build it first
        if (trainerListEl.children.length === 0) {
            trainers.forEach(trainer => {
                const card = document.createElement('div');
                card.className = 'res-trainer-card';
                card.dataset.id = trainer.id; // Store ID for reference
                card.innerHTML = `
                    <img src="${trainer.img}" alt="${trainer.name}" class="res-trainer-img">
                    <div class="res-trainer-info">
                        <div class="res-trainer-spec">${trainer.role}</div>
                        <div class="res-trainer-name">${trainer.name}</div>
                    </div>
                `;
                card.onclick = () => selectTrainer(trainer);
                trainerListEl.appendChild(card);
            });
        }

        // Just update classes to avoid re-rendering DOM (prevents image blink)
        Array.from(trainerListEl.children).forEach(card => {
            const cardId = parseInt(card.dataset.id);
            if (state.selectedTrainer && state.selectedTrainer.id === cardId) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    function renderMonthTabs() {
        monthTabsEl.innerHTML = '';
        const today = new Date();

        for (let i = 0; i < 3; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const monthNum = d.getMonth() + 1;
            
            const tab = document.createElement('div');
            tab.className = `res-month-tab ${state.viewMonthIndex === i ? 'active' : ''}`;
            tab.textContent = `${monthNum}월`;
            tab.onclick = () => {
                state.viewMonthIndex = i;
                renderMonthTabs();
                renderDates();
            };
            monthTabsEl.appendChild(tab);
        }
    }

    function renderDates() {
        dateListEl.innerHTML = '';
        const today = new Date();
        
        // Calculate Start Date for the selected view month
        let startDate = new Date();
        if (state.viewMonthIndex === 0) {
            // For current month, we still want to show the full calendar grid starting from day 1,
            // even if today is the 15th.
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else {
            startDate = new Date(today.getFullYear(), today.getMonth() + state.viewMonthIndex, 1);
        }

        const year = startDate.getFullYear();
        const month = startDate.getMonth(); // 0-indexed

        // First day of the month (0=Sun, 1=Mon, ...)
        const firstDayObj = new Date(year, month, 1);
        const startDayOfWeek = firstDayObj.getDay();

        // Last day of the month
        const lastDay = new Date(year, month + 1, 0).getDate();

        // 1. Add Empty Slots for days before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'date-card empty';
            dateListEl.appendChild(emptySlot);
        }

        // 2. Add Date Cards
        for (let d = 1; d <= lastDay; d++) {
            const dateObj = new Date(year, month, d);
            const dayIdx = dateObj.getDay(); // 0: Sun, 6: Sat
            
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const fullDate = `${year}-${mStr}-${dStr}`;

            const isSunday = (dayIdx === 0);
            const isSaturday = (dayIdx === 6);
            
            // Check if date is in the past relative to REAL today
            // (Only for the current month view)
            let isPast = false;
            if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                isPast = true;
            }

            // Check Trainer Availability (Is it a working day?)
            let isWorkingDay = true;
            if (state.selectedTrainer) {
                const slots = getAvailableSlots(state.selectedTrainer.id, fullDate);
                if (slots.length === 0) isWorkingDay = false;
            }

            const card = document.createElement('div');
            // Base classes
            let classString = 'date-card';
            
            if (state.selectedDate === fullDate) classString += ' selected';
            if (isSunday) classString += ' sunday';
            if (isSaturday) classString += ' saturday';
            
            // Disable logic: Past dates OR Non-working days
            if (isPast || !isWorkingDay) {
                classString += ' disabled';
            }

            card.className = classString;
            card.innerHTML = `<span class="date-num">${d}</span>`;
            
            // Allow selection if not disabled
            if (!card.classList.contains('disabled')) {
                card.onclick = () => selectDate(fullDate);
            }
            
            dateListEl.appendChild(card);
        }
    }

    function renderTimes() {
        timeListEl.innerHTML = '';
        if (!state.selectedTrainer || !state.selectedDate) return;

        // 1. Get Base Available Slots from Hierarchy
        const availableSlots = getAvailableSlots(state.selectedTrainer.id, state.selectedDate);

        if (availableSlots.length === 0) {
            timeListEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--grey-500);">예약 가능한 시간이 없습니다.</div>';
            return;
        }

                    // 2. Check Real Reservations from LocalStorage (MY Booking)
                    const data = getGymData();
                    const bookedTimesFromLocalStorage = data.reservations
                        .filter(r => r.trainer === state.selectedTrainer.name && r.date === state.selectedDate)
                        .map(r => r.time);
        
                    // 3. Check hardcoded booked slots (manually added by user)
                    const hardcodedBookedList = hardcodedBookedSlots[state.selectedTrainer.id]?.[state.selectedDate] || [];
        
                    // --- Validation for Past Time ---
                    const now = new Date();
                    const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const isToday = (state.selectedDate === currentDateStr);
                    const currentHour = now.getHours();
        
                    availableSlots.forEach((time) => {
                        let isBooked = false;
        
                        // Check MY real booking (User managed)
                        if (bookedTimesFromLocalStorage.includes(time)) isBooked = true;
        
                        // Check Hardcoded booked slots
                        if (hardcodedBookedList.includes(time)) isBooked = true;
            // Check Past Time (Real-time update)
            if (isToday) {
                const slotHour = parseInt(time.split(':')[0]);
                if (slotHour <= currentHour) {
                    isBooked = true; // Treat past time as 'booked' (disabled)
                }
            }

            const slot = document.createElement('div');
            slot.className = `time-slot ${isBooked ? 'booked' : ''} ${state.selectedTime === time ? 'selected' : ''}`;
            slot.textContent = time;
            
            if (!isBooked) {
                slot.onclick = () => selectTime(time);
            }
            timeListEl.appendChild(slot);
        });
    }

    // --- Logic Functions ---

    function selectTrainer(trainer) {
        state.selectedTrainer = trainer;
        state.selectedDate = null;
        state.selectedTime = null;
        
        renderTrainers();
        renderMonthTabs(); 
        renderDates(); 
        
        dateSection.style.opacity = '1';
        dateSection.style.pointerEvents = 'auto';
        timeSection.style.opacity = '0.5';
        timeSection.style.pointerEvents = 'none';
        timeListEl.innerHTML = ''; 

        updateBottomBar();
    }

    function selectDate(date) {
        state.selectedDate = date;
        state.selectedTime = null;
        
        renderDates(); 
        renderTimes(); 

        timeSection.style.opacity = '1';
        timeSection.style.pointerEvents = 'auto';

        updateBottomBar();
    }

    function selectTime(time) {
        state.selectedTime = time;
        
        const slots = document.querySelectorAll('.time-slot');
        slots.forEach(slot => {
            if (slot.classList.contains('booked')) return;
            slot.classList.remove('selected');
            if (slot.textContent === time) slot.classList.add('selected');
        });

        updateBottomBar();
    }

    function updateBottomBar() {
        const { selectedTrainer, selectedDate, selectedTime } = state;

        if (selectedTrainer && selectedDate && selectedTime) {
            summaryText.innerHTML = `<span style="color:var(--brand-blue)">${selectedTrainer.name}</span>님과 <span style="color:var(--brand-blue)">${selectedTime}</span>에 운동해요`;
            confirmBtn.disabled = false;
        } else if (selectedTrainer && selectedDate) {
            const [y, m, d] = selectedDate.split('-');
            summaryText.innerHTML = `<span style="color:var(--brand-blue)">${m}월 ${d}일</span> 시간을 선택해주세요`;
            confirmBtn.disabled = true;
        } else if (selectedTrainer) {
            summaryText.textContent = '날짜를 선택해주세요';
            confirmBtn.disabled = true;
        } else {
            summaryText.textContent = '트레이너를 선택해주세요';
            confirmBtn.disabled = true;
        }
    }

    // --- Initialization ---
    renderTrainers();
    renderMonthTabs();
    renderDates();

    // --- Event Listeners ---
    confirmBtn.onclick = () => {
        if (confirmBtn.disabled) return;

        // Double Check Ticket Count
        const data = getGymData();
        if (data.ptCount <= 0) {
            alert('PT 이용권이 부족합니다.');
            return;
        }

        // Double Check Duplicate (Client side race condition possible but ok for local)
        const isDuplicate = data.reservations.some(r => 
            r.trainer === state.selectedTrainer.name && 
            r.date === state.selectedDate && 
            r.time === state.selectedTime
        );

        if (isDuplicate) {
            alert('이미 예약된 시간입니다.');
            renderTimes(); // Refresh
            return;
        }
        
        // Process Booking
        data.ptCount -= 1;
        data.reservations.push({
            id: Date.now(),
            trainer: state.selectedTrainer.name,
            date: state.selectedDate,
            time: state.selectedTime,
            createdAt: new Date().toISOString()
        });
        saveGymData(data);
        
        // Fill Modal Data
        document.getElementById('modal-trainer').textContent = state.selectedTrainer.name;
        document.getElementById('modal-datetime').textContent = `${state.selectedDate} ${state.selectedTime}`;
        
        // Show Modal
        const modal = document.getElementById('res-modal');
        modal.style.display = 'flex';
        
        if(window.lucide) lucide.createIcons();
    };

    window.closeResModal = () => {
        document.getElementById('res-modal').style.display = 'none';
        window.location.hash = '#/mypage'; 
    };
}