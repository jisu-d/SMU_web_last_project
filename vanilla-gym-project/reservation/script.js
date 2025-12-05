function initReservation() {
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
        viewMonthIndex: 0 // 0: Current Month, 1: Next Month, 2: Month after next
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

    // 1. Render Trainers
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

    // 2. Render Month Tabs (Current + 2 Months)
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
                renderMonthTabs(); // Update active state
                renderDates(); // Update date list
            };
            monthTabsEl.appendChild(tab);
        }
    }

    // 3. Render Dates for Selected Month
    function renderDates() {
        dateListEl.innerHTML = '';
        const today = new Date();
        const days = ['일', '월', '화', '수', '목', '금', '토'];

        // Determine start and end date for the view
        let startDate = new Date();
        if (state.viewMonthIndex === 0) {
            // Current Month: Start from Today
            startDate = today;
        } else {
            // Future Month: Start from 1st
            startDate = new Date(today.getFullYear(), today.getMonth() + state.viewMonthIndex, 1);
        }

        // End date is the last day of the target month
        const targetMonth = new Date(today.getFullYear(), today.getMonth() + state.viewMonthIndex, 1);
        const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
        
        // Loop from start date to end of month
        let currentDay = startDate.getDate();
        // Correctly handle month rollover logic if startDate is in the middle of month
        // Actually simple loop:
        
        const year = startDate.getFullYear();
        const month = startDate.getMonth(); // 0-based

        for (let d = currentDay; d <= lastDay; d++) {
            const dateObj = new Date(year, month, d);
            const dayName = days[dateObj.getDay()];
            const dateNum = d;
            
            // Format YYYY-MM-DD
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const fullDate = `${year}-${mStr}-${dStr}`;

            const card = document.createElement('div');
            card.className = `date-card ${state.selectedDate === fullDate ? 'selected' : ''}`;
            card.innerHTML = `
                <span class="date-day">${dayName}</span>
                <span class="date-num">${dateNum}</span>
            `;
            card.onclick = () => selectDate(fullDate);
            dateListEl.appendChild(card);
        }
    }

    // 4. Render Time Slots
    function renderTimes() {
        timeListEl.innerHTML = '';
        if (!state.selectedTrainer || !state.selectedDate) return;

        const seed = state.selectedTrainer.id + state.selectedDate.replace(/-/g, '');
        let rng = parseInt(seed.substring(seed.length - 3)) || 123;

        timeSlots.forEach((time, index) => {
            const isBooked = ((rng + index * 7) % 10) < 3;
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
        // Keep dates but reset time
        state.selectedDate = null;
        state.selectedTime = null;
        
        renderTrainers();
        renderMonthTabs(); // Ensure tabs are rendered
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
            // Parse date to show pretty string e.g. "12월 25일"
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
        
        document.getElementById('modal-trainer').textContent = state.selectedTrainer.name;
        document.getElementById('modal-datetime').textContent = `${state.selectedDate} ${state.selectedTime}`;
        
        const modal = document.getElementById('res-modal');
        modal.style.display = 'flex';
        
        if(window.lucide) lucide.createIcons();
    };

    window.closeResModal = () => {
        document.getElementById('res-modal').style.display = 'none';
        window.location.hash = '#/mypage'; 
    };
}