// Make initMyPage globally available for the Router
window.initMyPage = function() {
    console.log("MyPage Initialized");

    // --- Dependency Check ---
    if (typeof MEMBERS === 'undefined' || typeof COUPON_TYPES === 'undefined') {
        console.error("Critical Error: Database (MEMBERS/COUPON_TYPES) not loaded.");
        return;
    }

    // --- Global State Management ---
    let CURRENT_USER_ID = null;
    let appliedCoupons = []; 

    // --- Helpers ---
    function getMemberData(memberId = CURRENT_USER_ID) {
        if (!memberId || !MEMBERS[memberId]) return null;
        return MEMBERS[memberId];
    }

    // Helper to save current member's data to global MEMBERS object and sync to localStorage
    function saveMemberData(memberId, data) {
        if (!memberId || !MEMBERS[memberId]) return;
        MEMBERS[memberId] = { ...MEMBERS[memberId], ...data };
        
        // Sync to 'gym_data' for reservation page compatibility
        if (memberId === CURRENT_USER_ID) {
            syncToLocalStorage(memberId);
        }
    }

    function syncToLocalStorage(memberId) {
        const userData = MEMBERS[memberId];
        if (!userData) return;

        // Map MEMBERS structure to gym_data structure used by reservation.js
        const gymData = {
            membershipExpire: userData.membershipExpire,
            ptCount: userData.ptCount,
            reservations: userData.reservations,
            lockerNumber: userData.locker ? userData.locker.number : null,
            lockerPassword: userData.locker ? userData.locker.password : null
        };
        localStorage.setItem('gym_data', JSON.stringify(gymData));
    }

    // New: Sync FROM localStorage to update MEMBERS with external changes (e.g. made in reservation page)
    function syncFromLocalStorage(memberId) {
        const storedData = localStorage.getItem('gym_data');
        if (!storedData || !MEMBERS[memberId]) return;

        const gymData = JSON.parse(storedData);
        
        // Update MEMBERS with latest data from localStorage
        MEMBERS[memberId].ptCount = gymData.ptCount;
        MEMBERS[memberId].reservations = gymData.reservations || [];
        MEMBERS[memberId].membershipExpire = gymData.membershipExpire;
        
        // Update locker if present
        if (gymData.lockerNumber) {
            MEMBERS[memberId].locker = {
                number: gymData.lockerNumber,
                password: gymData.lockerPassword
            };
        }
    }

    // Helper to get user ID
    function getCurrentUserId() {
        return CURRENT_USER_ID;
    }

    // --- DOM Elements ---
    const viewLogin = document.getElementById('view-login');
    const viewMain = document.getElementById('view-main');
    const viewPayment = document.getElementById('view-payment');

    const loginForm = document.getElementById('login-form');
    const testAccountBtn = document.getElementById('test-account-fill-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    const toPaymentBtns = document.querySelectorAll('.to-payment-btn');
    const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const appliedCouponsList = document.getElementById('applied-coupons-list');
    const couponInput = document.getElementById('coupon-input');
    const couponMessage = document.getElementById('coupon-message');

    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentSelect = document.getElementById('payment-select');
    const paymentSelectLabel = document.getElementById('payment-select-label');
    
    const basePriceDisplay = document.getElementById('base-price-display');
    const discountRow = document.getElementById('discount-row');
    const discountAmount = document.getElementById('discount-amount');
    const individualCouponDiscounts = document.getElementById('individual-coupon-discounts');
    const totalPriceDisplay = document.getElementById('total-price-display');

    // Locker Elements
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

    let currentPaymentType = 'membership'; // 'membership' or 'pt'

    // --- Event Listeners Setup ---

    // Login
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('userId')?.value;
            const password = document.getElementById('password')?.value;
            
            if (MEMBERS[id] && MEMBERS[id].password === password) {
                loginSuccess(id);
            } else {
                alert('아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        };
    }

    if (testAccountBtn) {
        testAccountBtn.onclick = () => {
            const idInput = document.getElementById('userId');
            const pwInput = document.getElementById('password');
            if (idInput) idInput.value = 'user123';
            if (pwInput) pwInput.value = '1234';
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            CURRENT_USER_ID = null;
            localStorage.removeItem('gym_user'); // Clear persistent login
            appliedCoupons = [];
            if (window.updateHeaderState) window.updateHeaderState(); // common.js function
            showLogin();
        };
    }

    // Navigation
    toPaymentBtns.forEach(btn => btn.onclick = showPayment);
    if (cancelPaymentBtn) cancelPaymentBtn.onclick = showMain;

    // Payment
    paymentTabs.forEach(tab => {
        tab.onclick = () => {
            paymentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPaymentType = tab.dataset.type;
            updatePaymentOptions();
        };
    });

    if (paymentSelect) paymentSelect.onchange = calculatePrice;
    
    // Coupon
    if (applyCouponBtn) {
        applyCouponBtn.onclick = applyCoupon;
    }

    // Payment Confirm
    if (confirmPaymentBtn) {
        confirmPaymentBtn.onclick = processPayment;
    }

    // Locker
    setupLockerEvents();

    // --- Core Functions ---

    function loginSuccess(id) {
        CURRENT_USER_ID = id;
        localStorage.setItem('gym_user', id); // Persist login
        syncToLocalStorage(id); // Sync data for other pages
        appliedCoupons = [];
        
        if (window.updateHeaderState) window.updateHeaderState();
        showMain();
    }

    function showLogin() {
        if (viewLogin) viewLogin.classList.add('active');
        if (viewMain) viewMain.classList.remove('active');
        if (viewPayment) viewPayment.classList.remove('active');
    }

    function showMain() {
        if (viewLogin) viewLogin.classList.remove('active');
        if (viewMain) viewMain.classList.add('active');
        if (viewPayment) viewPayment.classList.remove('active');
        renderDashboard();
    }

    function showPayment() {
        if (viewMain) viewMain.classList.remove('active');
        if (viewPayment) viewPayment.classList.add('active');
        
        // Reset UI
        if (couponInput) couponInput.value = '';
        if (couponMessage) couponMessage.textContent = '';
        appliedCoupons = []; 
        renderAppliedCoupons();

        const cashRadio = document.querySelector('input[name="payment-method"][value="cash"]');
        if (cashRadio) cashRadio.checked = true;
        
        updatePaymentOptions();
    }

    function renderDashboard() {
        const data = getMemberData();
        if (!data) return;

        // User Info
        const nameEl = document.getElementById('member-name');
        const contactEl = document.getElementById('member-contact');
        if (nameEl) nameEl.textContent = data.name;
        if (contactEl) contactEl.textContent = data.contact;

        // Membership
        const expireEl = document.getElementById('expire-date-display');
        if (expireEl) {
            if (data.membershipExpire) {
                const today = new Date();
                const expireAt = new Date(data.membershipExpire);
                
                today.setHours(0,0,0,0); 
                expireAt.setHours(0,0,0,0);

                if (expireAt >= today) {
                    const diffTime = expireAt - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    expireEl.textContent = `${diffDays}일 남았습니다.`; 
                    expireEl.style.color = 'var(--toss-blue)';
                } else {
                    expireEl.textContent = '만료됨';
                    expireEl.style.color = '#F04452';
                }
            } else {
                expireEl.textContent = '이용권 없음';
                expireEl.style.color = '#F04452';
            }
        }

        // PT
        const ptCountEl = document.getElementById('pt-count-display');
        if (ptCountEl) ptCountEl.textContent = data.ptCount;

        // Locker
        if (lockerNumberDisplay) {
            if (data.locker && data.locker.number) {
                lockerNumberDisplay.textContent = `${data.locker.number}번`;
                const pw = data.locker.password || '';
                lockerPasswordDigits.forEach((el, i) => { if(el) el.textContent = pw[i] || '-'; });
            } else {
                lockerNumberDisplay.textContent = '-';
                lockerPasswordDigits.forEach(el => { if(el) el.textContent = '-'; });
            }
        }

        // Reservations
        const resListContainer = document.getElementById('reservation-list-container');
        if (resListContainer) {
            resListContainer.innerHTML = '';
            if (!data.reservations || data.reservations.length === 0) {
                resListContainer.innerHTML = '<p style="color: var(--grey-500); text-align: center; padding: 2rem;">예약된 일정이 없습니다.</p>';
            } else {
                const sortedRes = [...data.reservations].sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
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
        }
        if(window.lucide) lucide.createIcons();
    }

    // --- Data Definitions for Payment ---
    const membershipOptions = Array.from({length: 12}, (_, i) => ({ label: `${i+1}개월`, value: i+1 }));
    const ptOptions = [
        { label: '10회', value: 10, price: 600000 },
        { label: '20회', value: 20, price: 1100000 },
        { label: '30회', value: 30, price: 1500000 }
    ];

    function updatePaymentOptions() {
        if (!paymentSelect) return;
        paymentSelect.innerHTML = '';
        
        const isMembership = currentPaymentType === 'membership';
        const options = isMembership ? membershipOptions : ptOptions;
        
        if (paymentSelectLabel) paymentSelectLabel.textContent = isMembership ? '기간 선택' : '횟수 선택';

        options.forEach((opt, index) => {
            const el = document.createElement('option');
            el.value = index;
            let displayPrice = 0;
            if (isMembership) {
                displayPrice = (opt.value * 10000) - (Math.floor(opt.value / 3) * 1000);
            } else {
                displayPrice = opt.price;
            }
            el.textContent = `${opt.label} (${displayPrice.toLocaleString()}원)`;
            paymentSelect.appendChild(el);
        });
        calculatePrice();
    }

    function applyCoupon() {
        const code = couponInput.value.trim();
        if (!code) return;

        if (!COUPON_TYPES[code]) {
            setMessage('존재하지 않는 쿠폰 코드입니다.', '#F04452');
            return;
        }

        const userData = getMemberData();
        if (!userData.coupons.includes(code)) {
            setMessage('보유하고 있지 않은 쿠폰입니다.', '#F04452');
            return;
        }

        if (appliedCoupons.includes(code)) {
            setMessage('이미 적용된 쿠폰입니다.', '#F04452');
            return;
        }

        const couponInfo = COUPON_TYPES[code];
        if (couponInfo.target && couponInfo.target !== currentPaymentType) {
            setMessage(`이 쿠폰은 ${couponInfo.target === 'pt' ? 'PT' : '회원권'} 결제에만 사용할 수 있습니다.`, '#F04452');
            return;
        }

        appliedCoupons.push(code);
        setMessage('쿠폰이 적용되었습니다.', '#059669');
        couponInput.value = '';
        renderAppliedCoupons();
        calculatePrice();
    }

    function setMessage(msg, color) {
        if (couponMessage) {
            couponMessage.textContent = msg;
            couponMessage.style.color = color;
        }
    }

    function renderAppliedCoupons() {
        if (!appliedCouponsList) return;
        appliedCouponsList.innerHTML = '';
        appliedCoupons.forEach(code => {
            const coupon = COUPON_TYPES[code];
            const tag = document.createElement('div');
            tag.className = 'mypage-coupon-tag';
            tag.innerHTML = `
                ${coupon.name}
                <button class="remove-coupon-btn" onclick="removeCoupon('${code}')">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                </button>
            `;
            appliedCouponsList.appendChild(tag);
        });
        if(window.lucide) lucide.createIcons();
    }

    function calculatePrice() {
        if (!paymentSelect) return 0;
        const index = paymentSelect.value;
        const isMembership = currentPaymentType === 'membership';
        const options = isMembership ? membershipOptions : ptOptions;
        const selected = options[index];
        if (!selected) return 0;

        let basePrice = 0;
        let finalPrice = 0;
        let bundleDiscount = 0;

        if (isMembership) {
            basePrice = selected.value * 10000;
            bundleDiscount = Math.floor(selected.value / 3) * 1000;
            finalPrice = basePrice - bundleDiscount;
        } else {
            basePrice = selected.price;
            finalPrice = selected.price;
        }

        let totalCouponDiscount = 0;
        let discountDetailsHtml = '';

        appliedCoupons.forEach(code => {
            const coupon = COUPON_TYPES[code];
            let discount = 0;
            if (coupon.type === 'fixed') {
                discount = coupon.value;
            } else if (coupon.type === 'percent') {
                discount = finalPrice * (coupon.value / 100);
            }
            totalCouponDiscount += discount;
            discountDetailsHtml += `
                <div class="mypage-price-row mypage-price-coupon" style="display: flex; margin-bottom: 0.25rem; justify-content: space-between; font-size: 0.95rem;">
                    <span>${coupon.name}</span>
                    <span>-${Math.floor(discount).toLocaleString()}원</span>
                </div>
            `;
        });

        const priceAfterCoupons = Math.max(0, finalPrice - totalCouponDiscount);

        if (basePriceDisplay) basePriceDisplay.textContent = `${basePrice.toLocaleString()}원`;
        if (discountRow) {
            discountRow.style.display = bundleDiscount > 0 ? 'flex' : 'none';
            if (discountAmount) discountAmount.textContent = `-${bundleDiscount.toLocaleString()}원`;
        }
        if (individualCouponDiscounts) individualCouponDiscounts.innerHTML = discountDetailsHtml;
        if (totalPriceDisplay) totalPriceDisplay.textContent = `${Math.floor(priceAfterCoupons).toLocaleString()}원`;

        return Math.floor(priceAfterCoupons);
    }

    function processPayment() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedMethod) {
            alert('결제 방법을 선택해주세요.');
            return;
        }

        const finalPrice = calculatePrice();
        const index = paymentSelect.value;
        const userData = getMemberData();

        if (currentPaymentType === 'membership') {
            const selected = membershipOptions[index];
            let newExpire = new Date();
            if (userData.membershipExpire) {
                const currentExpire = new Date(userData.membershipExpire);
                if (currentExpire > new Date()) newExpire = currentExpire;
            }
            newExpire.setMonth(newExpire.getMonth() + selected.value);
            saveMemberData(CURRENT_USER_ID, { membershipExpire: newExpire.toISOString().split('T')[0] });
            alert(`${selected.label} 회원권 등록 완료!\n(결제금액: ${finalPrice.toLocaleString()}원)`);
        } else {
            const selected = ptOptions[index];
            saveMemberData(CURRENT_USER_ID, { ptCount: userData.ptCount + selected.value });
            alert(`PT ${selected.label} 충전 완료!\n(결제금액: ${finalPrice.toLocaleString()}원)`);
        }

        // Remove used coupons
        const remainingCoupons = userData.coupons.filter(c => !appliedCoupons.includes(c));
        saveMemberData(CURRENT_USER_ID, { coupons: remainingCoupons });

        showMain();
    }

    function setupLockerEvents() {
        if (!window.LockerManager) return;
        
        if (editLockerBtn) {
            editLockerBtn.onclick = () => {
                const data = getMemberData();
                const info = { 
                    id: getCurrentUserId(), 
                    lockerNumber: data.locker.number, 
                    lockerPassword: data.locker.password 
                };
                LockerManager.openModal(info, [info]); 
            };
        }
        if (cancelLockerBtn) cancelLockerBtn.onclick = LockerManager.closeModal;
        if (saveLockerBtn) {
            saveLockerBtn.onclick = () => {
                const data = getMemberData();
                const info = { 
                    id: getCurrentUserId(), 
                    lockerNumber: data.locker.number, 
                    lockerPassword: data.locker.password 
                };
                LockerManager.saveInfo(info, [info], (updated) => {
                    saveMemberData(CURRENT_USER_ID, { 
                        locker: { number: updated.lockerNumber, password: updated.lockerPassword } 
                    });
                    renderDashboard();
                });
            };
        }
    }

    // --- Global Exports for HTML Event Handlers ---
    window.removeCoupon = (code) => {
        appliedCoupons = appliedCoupons.filter(c => c !== code);
        renderAppliedCoupons();
        calculatePrice();
        setMessage('', '');
    };

    window.cancelReservation = (id) => {
        if (!confirm('예약을 취소하시겠습니까?')) return; 
        const data = getMemberData();
        const newRes = data.reservations.filter(r => r.id !== id);
        saveMemberData(CURRENT_USER_ID, { 
            reservations: newRes,
            ptCount: data.ptCount + 1 
        });
        alert('예약 취소됨 (PT 1회 복구)');
        renderDashboard();
    };

    // --- Initialization Logic ---
    // Check for persistent login session
    const storedUser = localStorage.getItem('gym_user');
    if (storedUser && MEMBERS[storedUser]) {
        CURRENT_USER_ID = storedUser;
        syncFromLocalStorage(CURRENT_USER_ID); // Fetch latest data (reservations, etc.)
        if (window.updateHeaderState) window.updateHeaderState();
        showMain();
    } else {
        showLogin();
    }
};