function initMyPage() {
    // --- State Management (Local Storage) ---
    const userKey = 'gym_user';
    const dataKey = 'gym_data';

    // Helper to get data
    function getGymData() {
        const defaultData = {
            membershipExpire: null, // YYYY-MM-DD or null
            ptCount: 0,
            reservations: [], // { id, trainer, date, time, createdAt }
            lockerNumber: null,
            lockerPassword: null
        };
        const stored = localStorage.getItem(dataKey);
        return stored ? JSON.parse(stored) : defaultData;
    }

    // Helper to save data
    function saveGymData(data) {
        localStorage.setItem(dataKey, JSON.stringify(data));
    }

    // Helper to get user info (like ID)
    function getCurrentUserId() {
        return localStorage.getItem(userKey);
    }

    // --- Views ---
    const viewLogin = document.getElementById('view-login');
    const viewMain = document.getElementById('view-main');
    const viewPayment = document.getElementById('view-payment');

    // --- Elements ---
    const loginForm = document.getElementById('login-form');
    const testAccountBtn = document.getElementById('test-account-fill-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const toPaymentBtns = document.querySelectorAll('.to-payment-btn');
    const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

    // Payment Elements
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentSelect = document.getElementById('payment-select');
    const basePriceDisplay = document.getElementById('base-price-display');
    const discountRow = document.getElementById('discount-row');
    const discountAmount = document.getElementById('discount-amount');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const paymentSelectLabel = document.getElementById('payment-select-label');

    let currentPaymentType = 'membership'; // 'membership' or 'pt'

    // --- Locker Elements ---
    const editLockerBtn = document.getElementById('edit-locker-btn');
    const cancelLockerBtn = document.getElementById('cancel-locker-btn');
    const saveLockerBtn = document.getElementById('save-locker-btn');
    const lockerNumberDisplay = document.getElementById('locker-number-display');
    const lockerPasswordDigits = [
        document.getElementById('locker-password-digit-1'),
        document.getElementById('locker-password-digit-2'),
        document.getElementById('locker-password-digit-3'),
        document.getElementById('locker-password-digit-4')
    ];

    // --- Initialization Check ---
    const currentUser = localStorage.getItem(userKey);
    if (currentUser) {
        showMain();
    } else {
        showLogin();
    }

    // --- Functions ---

    function showLogin() {
        viewLogin.classList.add('active');
        viewMain.classList.remove('active');
        viewPayment.classList.remove('active');
    }

    function showMain() {
        viewLogin.classList.remove('active');
        viewMain.classList.add('active');
        viewPayment.classList.remove('active');
        renderDashboard();
    }

    function showPayment() {
        viewMain.classList.remove('active');
        viewPayment.classList.add('active');
        updatePaymentOptions(); // Reset to default
    }

    function renderDashboard() {
        const data = getGymData();
        
        // 1. Membership
        const expireEl = document.getElementById('expire-date-display');
        if (data.membershipExpire) {
            const today = new Date();
            const expire = new Date(data.membershipExpire);
            if (expire >= today) {
                expireEl.textContent = `${data.membershipExpire} 까지`;
                expireEl.style.color = 'var(--toss-blue)';
            } else {
                expireEl.textContent = '만료됨';
                expireEl.style.color = '#F04452';
            }
        } else {
            expireEl.textContent = '이용권 없음';
            expireEl.style.color = '#F04452';
        }

        // 2. PT Count
        document.getElementById('pt-count-display').textContent = data.ptCount;

        // 3. Locker Info
        if (data.lockerNumber) {
            lockerNumberDisplay.textContent = `${data.lockerNumber}번`;
            if (data.lockerPassword) {
                lockerPasswordDigits.forEach((digitEl, index) => {
                    digitEl.textContent = data.lockerPassword[index] || '-';
                });
            } else {
                lockerPasswordDigits.forEach(digitEl => digitEl.textContent = '-');
            }
        } else {
            lockerNumberDisplay.textContent = '-';
            lockerPasswordDigits.forEach(digitEl => digitEl.textContent = '-');
        }

        // 4. Reservations
        const resListContainer = document.getElementById('reservation-list-container');
        if (data.reservations.length === 0) {
            resListContainer.innerHTML = '<p style="color: var(--grey-500); text-align: center; padding: 2rem;">예약된 일정이 없습니다.</p>';
        } else {
            resListContainer.innerHTML = '';
            // Sort by date
            const sortedRes = data.reservations.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
            
            sortedRes.forEach(res => {
                const item = document.createElement('div');
                item.className = 'reservation-item';
                item.innerHTML = `
                    <div class="reservation-info">
                        <div class="reservation-date">
                            <i data-lucide="calendar" style="width: 1rem; height: 1rem; color: var(--toss-blue);"></i>
                            ${res.date} <span style="color: var(--grey-300);">|</span> ${res.time}
                        </div>
                        <div class="reservation-trainer">
                            <i data-lucide="user" style="width: 0.9rem; height: 0.9rem;"></i>
                            ${res.trainer} 트레이너
                        </div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="cancelReservation(${res.id})" 
                        style="color: #F04452; border-color: rgba(240, 68, 82, 0.3); background-color: rgba(240, 68, 82, 0.05);">
                        취소
                    </button>
                `;
                resListContainer.appendChild(item);
            });
        }
        
        // Load Lucide icons
        if(window.lucide) lucide.createIcons();
    }

    // Global scope for inline onclick
    window.cancelReservation = (id) => {
        if (!confirm('예약을 취소하시겠습니까?\n(취소 시 횟수가 복구됩니다)')) return; 
        
        const data = getGymData();
        const targetRes = data.reservations.find(r => r.id === id);
        
        if (targetRes) {
            data.reservations = data.reservations.filter(r => r.id !== id);
            data.ptCount += 1; // Refund ticket
            saveGymData(data);
            alert('예약이 취소되었습니다.');
            renderDashboard();
        }
    };

    // --- Payment Logic ---
    
    const membershipOptions = [
        { label: '1개월', value: 1, price: 70000 },
        { label: '3개월', value: 3, price: 190000 }, // Discounted
        { label: '6개월', value: 6, price: 360000 },
        { label: '12개월', value: 12, price: 600000 }
    ];

    const ptOptions = [
        { label: '10회', value: 10, price: 600000 }, // 60k per session
        { label: '20회', value: 20, price: 1100000 }, // 55k per session (Discount)
        { label: '30회', value: 30, price: 1500000 }  // 50k per session
    ];

    function updatePaymentOptions() {
        paymentSelect.innerHTML = '';
        const options = currentPaymentType === 'membership' ? membershipOptions : ptOptions;
        paymentSelectLabel.textContent = currentPaymentType === 'membership' ? '이용 기간' : '횟수 선택';

        options.forEach((opt, index) => {
            const el = document.createElement('option');
            el.value = index; // Use index to lookup
            el.textContent = `${opt.label} (${opt.price.toLocaleString()}원)`;
            paymentSelect.appendChild(el);
        });
        calculatePrice();
    }

    function calculatePrice() {
        const index = paymentSelect.value;
        const options = currentPaymentType === 'membership' ? membershipOptions : ptOptions;
        const selected = options[index];

        if (!selected) return;

        // Fake base price for comparison (showing discount)
        let basePrice = 0;
        if (currentPaymentType === 'membership') {
            basePrice = selected.value * 70000; // Assume 70k base
        } else {
            basePrice = selected.value * 70000; // Assume 70k base per PT
        }

        const finalPrice = selected.price;
        const discount = basePrice - finalPrice;

        basePriceDisplay.textContent = `${basePrice.toLocaleString()}원`;
        
        if (discount > 0) {
            discountRow.style.display = 'flex';
            discountAmount.textContent = `-${discount.toLocaleString()}원`;
        } else {
            discountRow.style.display = 'none';
        }

        totalPriceDisplay.textContent = `${finalPrice.toLocaleString()}원`;
    }

    // --- Event Listeners ---

    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('userId').value;
        localStorage.setItem(userKey, id);
        
        // Initialize data if empty
        if (!localStorage.getItem(dataKey)) {
            saveGymData({ membershipExpire: null, ptCount: 0, reservations: [] });
        }
        showMain();
    };

    testAccountBtn.onclick = () => {
        document.getElementById('userId').value = 'user123';
        document.getElementById('password').value = '1234';
    };

    logoutBtn.onclick = () => {
        localStorage.removeItem(userKey);
        showLogin();
    };

    toPaymentBtns.forEach(btn => btn.onclick = showPayment);
    cancelPaymentBtn.onclick = showMain;

    paymentTabs.forEach(tab => {
        tab.onclick = () => {
            paymentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPaymentType = tab.dataset.type;
            updatePaymentOptions();
        };
    });

    paymentSelect.onchange = calculatePrice;

    confirmPaymentBtn.onclick = () => {
        const index = paymentSelect.value;
        const data = getGymData();
        
        if (currentPaymentType === 'membership') {
            const selected = membershipOptions[index];
            const months = selected.value;
            
            // Calculate new expiry
            let newExpire;
            const today = new Date();
            if (data.membershipExpire && new Date(data.membershipExpire) > today) {
                // Extend
                newExpire = new Date(data.membershipExpire);
            } else {
                // New
                newExpire = new Date();
            }
            newExpire.setMonth(newExpire.getMonth() + months);
            data.membershipExpire = newExpire.toISOString().split('T')[0];
            
            alert(`${selected.label} 회원권이 등록되었습니다.`);
        } else {
            const selected = ptOptions[index];
            data.ptCount += selected.value;
            alert(`PT ${selected.label}가 충전되었습니다.`);
        }

        saveGymData(data);
        showMain();
    };

    // --- Locker Management Integration ---
    if (window.LockerManager) {
        editLockerBtn.onclick = () => {
            const data = getGymData();
            // LockerManager expects user object with locker info, and allMembers (mocked for now)
            const currentUserData = { 
                id: getCurrentUserId(), 
                lockerNumber: data.lockerNumber, 
                lockerPassword: data.lockerPassword 
            };
            // For simplicity in this demo, allMembers check only against current user
            // In a real app, this would query a backend for all occupied lockers
            LockerManager.openModal(currentUserData, [currentUserData]); 
        };

        cancelLockerBtn.onclick = LockerManager.closeModal;

        saveLockerBtn.onclick = () => {
            const data = getGymData();
            const currentUserData = { 
                id: getCurrentUserId(), 
                lockerNumber: data.lockerNumber, 
                lockerPassword: data.lockerPassword 
            };

            LockerManager.saveInfo(currentUserData, [currentUserData], (updatedUser) => {
                // Update local storage gym_data with new locker info
                data.lockerNumber = updatedUser.lockerNumber;
                data.lockerPassword = updatedUser.lockerPassword;
                saveGymData(data);
                renderDashboard(); // Re-render dashboard to show updated locker info
            });
        };
    } else {
        console.error('LockerManager not found. Make sure mypage/modules/locker.js is loaded.');
    }
}
