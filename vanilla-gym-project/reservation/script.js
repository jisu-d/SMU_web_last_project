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
        selectedTime: null
    };

    // --- DOM Elements ---
    const trainerListEl = document.getElementById('trainer-list');
    const dateListEl = document.getElementById('date-list');
    const timeListEl = document.getElementById('time-list');
    
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

    // 2. Render Dates (Next 14 days from TODAY)
    function renderDates() {
        dateListEl.innerHTML = '';
        const today = new Date(); // Always uses current client time
        const days = ['일', '월', '화', '수', '목', '금', '토'];

        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            
            const dayName = days[d.getDay()];
            const dateNum = d.getDate();
            // Format: YYYY-MM-DD
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const fullDate = `${year}-${month}-${day}`;

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

    // 3. Render Time Slots (with Random Availability)
    function renderTimes() {
        timeListEl.innerHTML = '';
        if (!state.selectedTrainer || !state.selectedDate) return;

        // Create deterministic random based on trainer + date 
        // to simulate persistent "booked" state for demo
        const seed = state.selectedTrainer.id + state.selectedDate.replace(/-/g, '');
        let rng = parseInt(seed.substring(seed.length - 3)); 

        timeSlots.forEach((time, index) => {
            // Simulate booking: 30% chance it's booked
            // Simple pseudo-random logic for demo
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
        // Reset subsequent steps
        state.selectedDate = null;
        state.selectedTime = null;
        
        renderTrainers();
        renderDates(); // Refresh selection visually
        
        // Activate Step 2
        dateSection.style.opacity = '1';
        dateSection.style.pointerEvents = 'auto';
        timeSection.style.opacity = '0.5';
        timeSection.style.pointerEvents = 'none';
        timeListEl.innerHTML = ''; // Clear times

        updateBottomBar();
    }

    function selectDate(date) {
        state.selectedDate = date;
        state.selectedTime = null;
        
        renderDates(); // Update visual state
        renderTimes(); // Generate times

        // Activate Step 3
        timeSection.style.opacity = '1';
        timeSection.style.pointerEvents = 'auto';

        updateBottomBar();
    }

    function selectTime(time) {
        state.selectedTime = time;
        
        // Update visual state manually to avoid re-randomizing booked slots
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
            summaryText.textContent = '시간을 선택해주세요';
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
    // Render dates initially but disabled visually until trainer picked? 
    // Actually renderDates() is safe to call, step 2 section is opaque
    renderDates(); 

    // --- Event Listeners ---
    confirmBtn.onclick = () => {
        if (confirmBtn.disabled) return;
        
        // Fill Modal Data
        document.getElementById('modal-trainer').textContent = state.selectedTrainer.name;
        document.getElementById('modal-datetime').textContent = `${state.selectedDate} ${state.selectedTime}`;
        
        // Show Modal
        const modal = document.getElementById('res-modal');
        modal.style.display = 'flex';
        
        // Reset Lucide icons just in case
        if(window.lucide) lucide.createIcons();
    };

    // Global Modal Closer
    window.closeResModal = () => {
        document.getElementById('res-modal').style.display = 'none';
        // Optional: Reset page or redirect
        window.location.hash = '#/mypage'; // Redirect to mypage after booking
    };
}
