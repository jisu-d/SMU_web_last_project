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
        // Force MyPage to show payment view (need a way to signal this)
        // Simple hack: set a temp flag or just route. 
        // Since router reloads script, we can't pass params easily without URL search params support in router.
        // We will rely on user navigating or just alert.
        // Better: Since we are SPA, just route to mypage. 
        window.location.hash = '#/mypage';
        return; 
    }

    // --- Data ---
    const trainers = [
        { id: 1, name: '엄희수', role: '소프트웨어', img: 'img/1.png' },
        { id: 2, name: '강건우', role: '다이어트', img: 'img/2.png' },
        { id: 3, name: '최영우', role: '재활/교정', img: 'img/3.png' },
        { id: 4, name: '임지수', role: '소프트웨어', img: 'img/4.png' }
    ];

    const timeSlots = [
        '09:00', '10:00', '11:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00', 
        '18:00', '19:00', '20:00', '21:00'
    ];

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
        trainerListEl.innerHTML = '';
        trainers.forEach(trainer => {
            const card = document.createElement('div');
            card.className = `res-trainer-card ${state.selectedTrainer?.id === trainer.id ? 'selected' : ''}`;
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
        const days = ['일', '월', '화', '수', '목', '금', '토'];

        let startDate = new Date();
        if (state.viewMonthIndex === 0) {
            startDate = today;
        } else {
            startDate = new Date(today.getFullYear(), today.getMonth() + state.viewMonthIndex, 1);
        }

        const targetMonth = new Date(today.getFullYear(), today.getMonth() + state.viewMonthIndex, 1);
        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
        
        const year = startDate.getFullYear();
        const month = startDate.getMonth();

        let currentDay = startDate.getDate();

        for (let d = currentDay; d <= lastDay; d++) {
            const dateObj = new Date(year, month, d);
            const dayIdx = dateObj.getDay(); // 0: Sun, 6: Sat
            const dayName = days[dayIdx];
            const dateNum = d;
            
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const fullDate = `${year}-${mStr}-${dStr}`;

            const isSunday = (dayIdx === 0);

            const card = document.createElement('div');
            card.className = `date-card ${state.selectedDate === fullDate ? 'selected' : ''} ${isSunday ? 'disabled' : ''}`;
            card.innerHTML = `
                <span class="date-day">${dayName}</span>
                <span class="date-num">${dateNum}</span>
            `;
            
            if (!isSunday) {
                card.onclick = () => selectDate(fullDate);
            }
            
            dateListEl.appendChild(card);
        }
    }

    function renderTimes() {
        timeListEl.innerHTML = '';
        if (!state.selectedTrainer || !state.selectedDate) return;

        // Determine Day of Week for selected date
        const selDateObj = new Date(state.selectedDate);
        const dayIdx = selDateObj.getDay(); // 0: Sun, 6: Sat
        
        // Define Available Slots based on Day
        // Weekday: 09:00 ~ 21:00 (All slots)
        // Saturday: 09:00 ~ 18:00 (Limit)
        // Sunday: None (Should not be selectable, but safe guard)
        
        let availableSlots = timeSlots; // Default all
        
        if (dayIdx === 6) { // Saturday
            // 09:00 to 18:00 only. (last slot starts at 17:00? "09:00 - 18:00" usually means close at 18:00)
            // If operation is until 18:00, the last 1-hour PT slot starts at 17:00.
            availableSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        } else if (dayIdx === 0) { // Sunday
            availableSlots = [];
        }

        // Check Real Reservations from LocalStorage
        const data = getGymData();
        // Filter reservations for this trainer and date
        const bookedTimes = data.reservations
            .filter(r => r.trainer === state.selectedTrainer.name && r.date === state.selectedDate)
            .map(r => r.time);

        // Also keep pseudo-random for demo filler
        const seed = state.selectedTrainer.id + state.selectedDate.replace(/-/g, '');
        let rng = parseInt(seed.substring(seed.length - 3)) || 123;

        // --- Validation for Past Time ---
        const now = new Date();
        const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = (state.selectedDate === currentDateStr);
        const currentHour = now.getHours();

        availableSlots.forEach((time, index) => {
            // 1. Check random 'other user' booking
            let isBooked = ((rng + index * 7) % 10) < 2; // 20% chance occupied by others
            
            // 2. Check MY real booking
            if (bookedTimes.includes(time)) isBooked = true;

            // 3. Check Past Time (Real-time update)
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
            summaryText.innerHTML = `<span style="color:var(--toss-blue)">${selectedTrainer.name}</span>님과 <span style="color:var(--toss-blue)">${selectedTime}</span>에 운동해요`;
            confirmBtn.disabled = false;
        } else if (selectedTrainer && selectedDate) {
            const [y, m, d] = selectedDate.split('-');
            summaryText.innerHTML = `<span style="color:var(--toss-blue)">${m}월 ${d}일</span> 시간을 선택해주세요`;
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