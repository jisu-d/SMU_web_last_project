function initReservation() {
    // --- 상태 관리 (로컬 스토리지) ---
    const userKey = 'gym_user';
    const dataKey = 'gym_data';

    // 데이터 가져오기 헬퍼
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

    // --- 접근 제어 ---
    const currentUser = localStorage.getItem(userKey);
    if (!currentUser) {
        alert('로그인이 필요한 서비스입니다.');
        window.location.hash = '#/mypage'; // 로그인으로 리디렉션
        return; // 초기화 중단
    }

    const currentData = getGymData();
    if (currentData.ptCount <= 0) {
        alert('PT 이용권이 없습니다.\n이용권 구매 페이지로 이동합니다.');
        window.location.hash = '#/mypage';
        return; 
    }

    // --- 데이터 ---
    
    // 계층적 스케줄 데이터: 주간 패턴 + 예외
    const trainerSchedules = {
        // 1. 엄희수 (성실형: 주 6일, 아침~저녁)
        1: {
            weekly: {
                1: null, // 월
                2: { start: '06:00', end: '15:00', break: ['12:00'] }, // 화
                3: { start: '06:00', end: '15:00', break: ['12:00'] }, // 수
                4: null, // 목
                5: { start: '06:00', end: '15:00', break: ['12:00'] }, // 금
                6: { start: '09:00', end: '13:00', break: [] },        // 토
                0: null // 일 (휴무)
            },
            exceptions: {
                '2024-12-31': { start: '09:00', end: '12:00', break: [] } // 단축 근무
            }
        },
        // 2. 강건우 (직장인 타겟: 오후~밤)
        2: {
            weekly: {
                1: { start: '13:00', end: '22:00', break: ['17:00'] },
                2: { start: '13:00', end: '22:00', break: ['17:00'] },
                3: null,
                4: { start: '13:00', end: '22:00', break: ['17:00'] },
                5: { start: '13:00', end: '22:00', break: ['17:00'] },
                6: null, // 토 (휴무)
                0: null // 일 (휴무 - 변경됨)
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
                5: null,
                6: { start: '10:00', end: '14:00', break: [] },
                0: null // 일 (휴무)
            },
            exceptions: {}
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
                0: null // 일 (휴무 - 변경됨)
            },
            exceptions: {}
        }
    };

    // 하드코딩된 예약 슬롯
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

    // 헬퍼: 스케줄에 따른 슬롯 생성
    function getAvailableSlots(trainerId, dateStr) {
        // 0. 전역 공휴일 확인 (GymUtils 사용)
        if (window.GymUtils) {
            const [y, m, d] = dateStr.split('-').map(Number);
            if (GymUtils.isClosedDay(y, m - 1, d)) return []; // GymUtils에서 m은 0부터 시작
        }

        const schedule = trainerSchedules[trainerId];
        if (!schedule) return [];

        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay(); // 0:일 ~ 6:토

        // 1. 예외 먼저 확인
        let dayConfig = null;
        if (schedule.exceptions && schedule.exceptions[dateStr] !== undefined) {
            dayConfig = schedule.exceptions[dateStr];
        } else {
            // 2. 주간 스케줄로 폴백
            dayConfig = schedule.weekly[dayOfWeek];
        }

        if (!dayConfig) return []; // 휴무일 (일요일이 null로 설정된 경우 포함)

        // 시작부터 종료까지 슬롯 생성
        const slots = [];
        let current = parseInt(dayConfig.start.split(':')[0]);
        const end = parseInt(dayConfig.end.split(':')[0]);

        while (current < end) {
            const timeStr = String(current).padStart(2, '0') + ':00';
            // 휴식 시간 제외
            if (!dayConfig.break.includes(timeStr)) {
                slots.push(timeStr);
            }
            current++;
        }

        return slots;
    }

    // --- 상태 ---
    let state = {
        selectedTrainer: null,
        selectedDate: null,
        selectedTime: null,
        viewMonthIndex: 0
    };

    // --- DOM 요소 ---
    const trainerListEl = document.getElementById('trainer-list');
    const dateListEl = document.getElementById('date-list');
    const timeListEl = document.getElementById('time-list');
    const monthTabsEl = document.getElementById('month-tabs');
    
    const dateSection = document.getElementById('date-section');
    const timeSection = document.getElementById('time-section');

    const summaryText = document.getElementById('summary-text');
    const confirmBtn = document.getElementById('res-confirm-btn');

    // --- 렌더링 함수 ---

    function renderTrainers() {
        // 목록이 비어있으면 먼저 빌드
        if (trainerListEl.children.length === 0) {
            trainers.forEach(trainer => {
                const card = document.createElement('div');
                card.className = 'res-trainer-card';
                card.dataset.id = trainer.id; // 참조용 ID 저장
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

        // DOM 재렌더링 방지를 위해 클래스만 업데이트 (이미지 깜빡임 방지)
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
        
        // 선택된 뷰 월의 시작 날짜 계산
        let startDate = new Date();
        if (state.viewMonthIndex === 0) {
            // 현재 월의 경우, 오늘이 15일이라도 1일부터 전체 캘린더 그리드를 표시
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else {
            startDate = new Date(today.getFullYear(), today.getMonth() + state.viewMonthIndex, 1);
        }

        const year = startDate.getFullYear();
        const month = startDate.getMonth(); // 0부터 시작

        // 월의 첫째 날 (0=일, 1=월, ...)
        const firstDayObj = new Date(year, month, 1);
        const startDayOfWeek = firstDayObj.getDay();

        // 월의 마지막 날
        const lastDay = new Date(year, month + 1, 0).getDate();

        // 1. 1일 이전의 날짜에 빈 슬롯 추가
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'date-card empty';
            dateListEl.appendChild(emptySlot);
        }

        // 2. 날짜 카드 추가
        for (let d = 1; d <= lastDay; d++) {
            const dateObj = new Date(year, month, d);
            const dayIdx = dateObj.getDay(); // 0: 일, 6: 토
            
            const mStr = String(month + 1).padStart(2, '0');
            const dStr = String(d).padStart(2, '0');
            const fullDate = `${year}-${mStr}-${dStr}`;

            const isSunday = (dayIdx === 0);
            const isSaturday = (dayIdx === 6);
            
            // 실제 오늘과 비교하여 과거 날짜인지 확인
            // (현재 월 뷰에만 해당)
            let isPast = false;
            if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                isPast = true;
            }

            // 트레이너 가능 여부 확인 (근무일인가?)
            let isWorkingDay = true;
            if (state.selectedTrainer) {
                const slots = getAvailableSlots(state.selectedTrainer.id, fullDate);
                if (slots.length === 0) isWorkingDay = false;
            }

            const card = document.createElement('div');
            // 기본 클래스
            let classString = 'date-card';
            
            if (state.selectedDate === fullDate) classString += ' selected';
            if (isSunday) classString += ' sunday';
            if (isSaturday) classString += ' saturday';
            
            // 비활성화 로직: 과거 날짜 또는 근무하지 않는 날
            if (isPast || !isWorkingDay) {
                classString += ' disabled';
            }

            card.className = classString;
            card.innerHTML = `<span class="date-num">${d}</span>`;
            
            // 비활성화되지 않은 경우 선택 허용
            if (!card.classList.contains('disabled')) {
                card.onclick = () => selectDate(fullDate);
            }
            
            dateListEl.appendChild(card);
        }
    }

    function renderTimes() {
        timeListEl.innerHTML = '';
        if (!state.selectedTrainer || !state.selectedDate) return;

        // 1. 계층 구조에서 기본 예약 가능 슬롯 가져오기
        const availableSlots = getAvailableSlots(state.selectedTrainer.id, state.selectedDate);

        if (availableSlots.length === 0) {
            timeListEl.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--grey-500);">예약 가능한 시간이 없습니다.</div>';
            return;
        }

                    // 2. 로컬 스토리지에서 실제 예약 확인 (내 예약)
                    const data = getGymData();
                    const bookedTimesFromLocalStorage = data.reservations
                        .filter(r => r.trainer === state.selectedTrainer.name && r.date === state.selectedDate)
                        .map(r => r.time);
        
                    // 3. 하드코딩된 예약 슬롯 확인 (사용자가 수동으로 추가함)
                    const hardcodedBookedList = hardcodedBookedSlots[state.selectedTrainer.id]?.[state.selectedDate] || [];
        
                    // --- 과거 시간 유효성 검사 ---
                    const now = new Date();
                    const currentDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const isToday = (state.selectedDate === currentDateStr);
                    const currentHour = now.getHours();
        
                    availableSlots.forEach((time) => {
                        let isBooked = false;
        
                        // 내 실제 예약 확인 (사용자 관리)
                        if (bookedTimesFromLocalStorage.includes(time)) isBooked = true;
        
                        // 하드코딩된 예약 슬롯 확인
                        if (hardcodedBookedList.includes(time)) isBooked = true;
            // 과거 시간 확인 (실시간 업데이트)
            if (isToday) {
                const slotHour = parseInt(time.split(':')[0]);
                if (slotHour <= currentHour) {
                    isBooked = true; // 과거 시간을 '예약됨'(비활성화)으로 처리
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

    // --- 로직 함수 ---

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

    // --- 초기화 ---
    renderTrainers();
    renderMonthTabs();
    renderDates();

    // --- 이벤트 리스너 ---
    confirmBtn.onclick = () => {
        if (confirmBtn.disabled) return;

        // 이용권 수 재확인
        const data = getGymData();
        if (data.ptCount <= 0) {
            alert('PT 이용권이 부족합니다.');
            return;
        }

        // 중복 확인 (클라이언트 측 경쟁 상태가 가능하지만 로컬에서는 괜찮음)
        const isDuplicate = data.reservations.some(r => 
            r.trainer === state.selectedTrainer.name && 
            r.date === state.selectedDate && 
            r.time === state.selectedTime
        );

        if (isDuplicate) {
            alert('이미 예약된 시간입니다.');
            renderTimes(); // 새로고침
            return;
        }
        
        // 예약 처리
        data.ptCount -= 1;
        data.reservations.push({
            id: Date.now(),
            trainer: state.selectedTrainer.name,
            date: state.selectedDate,
            time: state.selectedTime,
            createdAt: new Date().toISOString()
        });
        saveGymData(data);
        
        // 모달 데이터 채우기
        document.getElementById('modal-trainer').textContent = state.selectedTrainer.name;
        document.getElementById('modal-datetime').textContent = `${state.selectedDate} ${state.selectedTime}`;
        
        // 모달 표시
        const modal = document.getElementById('res-modal');
        modal.style.display = 'flex';
        
        if(window.lucide) lucide.createIcons();
    };

    window.closeResModal = () => {
        document.getElementById('res-modal').style.display = 'none';
        window.location.hash = '#/mypage'; 
    };
}