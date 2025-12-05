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
    const couponDiscountRow = document.getElementById('coupon-discount-row');
    const couponDiscountAmount = document.getElementById('coupon-discount-amount');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const paymentSelectLabel = document.getElementById('payment-select-label');
    
    // Payment Methods & Coupon
    const couponInput = document.getElementById('coupon-input');
    const couponMessage = document.getElementById('coupon-message');

    let currentPaymentType = 'membership'; // 'membership' or 'pt'
    const COUPON_CODE = 'X-mas'; // Secret Coupon Code

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

    // --- Event Listeners (Moved to top) ---

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const idInput = document.getElementById('userId');
            const id = idInput ? idInput.value : '';
            
            if (!id) return; // Basic validation

            localStorage.setItem(userKey, id);
            
            if (!localStorage.getItem(dataKey)) {
                saveGymData({ membershipExpire: null, ptCount: 0, reservations: [] });
            }
            
            if (window.updateHeaderState) window.updateHeaderState();
            
            showMain();
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
            localStorage.removeItem(userKey);
            if (window.updateHeaderState) window.updateHeaderState();
            showLogin();
        };
    }

    toPaymentBtns.forEach(btn => btn.onclick = showPayment);
    if (cancelPaymentBtn) cancelPaymentBtn.onclick = showMain;

    paymentTabs.forEach(tab => {
        tab.onclick = () => {
            paymentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPaymentType = tab.dataset.type;
            updatePaymentOptions();
        };
    });

    if (paymentSelect) paymentSelect.onchange = calculatePrice;
    if (couponInput) couponInput.addEventListener('input', calculatePrice);

    if (confirmPaymentBtn) {
        confirmPaymentBtn.onclick = () => {
            // Validation: Payment Method
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
            if (!selectedMethod) {
                alert('결제 방법을 선택해주세요.');
                return;
            }

            // Validation: Coupon Code (only if something is typed)
            const code = couponInput.value.trim();
            if (code.length > 0 && code !== COUPON_CODE) {
                alert('유효하지 않은 쿠폰 코드입니다. 코드를 확인하거나 지워주세요.');
                couponInput.focus();
                return;
            }

            // Proceed
            const index = paymentSelect.value;
            const data = getGymData();
            
            if (currentPaymentType === 'membership') {
                const selected = membershipOptions[index];
                const months = selected.value;
                
                let newExpire;
                const today = new Date();
                if (data.membershipExpire && new Date(data.membershipExpire) > today) {
                    newExpire = new Date(data.membershipExpire);
                } else {
                    newExpire = new Date();
                }
                newExpire.setMonth(newExpire.getMonth() + months);
                data.membershipExpire = newExpire.toISOString().split('T')[0];
                
                alert(`${selected.label} 회원권이 등록되었습니다. (만료일: ${data.membershipExpire})`);
            } else {
                const selected = ptOptions[index];
                data.ptCount += selected.value;
                alert(`PT ${selected.label}가 충전되었습니다.`);
            }

            saveGymData(data);
            showMain();
        };
    }

    // --- Locker Management Integration ---
    if (window.LockerManager) {
        if (editLockerBtn) {
            editLockerBtn.onclick = () => {
                const data = getGymData();
                const currentUserData = { 
                    id: getCurrentUserId(), 
                    lockerNumber: data.lockerNumber, 
                    lockerPassword: data.lockerPassword 
                };
                LockerManager.openModal(currentUserData, [currentUserData]); 
            };
        }

        if (cancelLockerBtn) cancelLockerBtn.onclick = LockerManager.closeModal;

        if (saveLockerBtn) {
            saveLockerBtn.onclick = () => {
                const data = getGymData();
                const currentUserData = { 
                    id: getCurrentUserId(), 
                    lockerNumber: data.lockerNumber, 
                    lockerPassword: data.lockerPassword 
                };

                LockerManager.saveInfo(currentUserData, [currentUserData], (updatedUser) => {
                    data.lockerNumber = updatedUser.lockerNumber;
                    data.lockerPassword = updatedUser.lockerPassword;
                    saveGymData(data);
                    renderDashboard();
                });
            };
        }
    }

    // --- Initialization Check ---
    const currentUser = localStorage.getItem(userKey);
    if (currentUser) {
        showMain();
    } else {
        showLogin();
    }

    // --- Functions ---

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
        // Reset Coupon
        if (couponInput) couponInput.value = '';
        if (couponMessage) couponMessage.textContent = '';
        // Default to Cash checked
        const cashRadio = document.querySelector('input[name="payment-method"][value="cash"]');
        if (cashRadio) cashRadio.checked = true;
        
        updatePaymentOptions(); // Reset options
    }

    function renderDashboard() {
        const data = getGymData();
        
        // 1. Membership
        const expireEl = document.getElementById('expire-date-display');
        if (expireEl) {
            if (data.membershipExpire) {
                const today = new Date();
                const expire = new Date(data.membershipExpire);
                
                today.setHours(0, 0, 0, 0);
                expire.setHours(0, 0, 0, 0);

                if (expire >= today) {
                    const diffTime = expire - today;
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

        // 2. PT Count
        const ptCountEl = document.getElementById('pt-count-display');
        if (ptCountEl) {
            ptCountEl.textContent = data.ptCount;
        }

        // 3. Locker Info
        if (lockerNumberDisplay) {
            if (data.lockerNumber) {
                lockerNumberDisplay.textContent = `${data.lockerNumber}번`;
                if (data.lockerPassword) {
                    lockerPasswordDigits.forEach((digitEl, index) => {
                        if (digitEl) digitEl.textContent = data.lockerPassword[index] || '-';
                    });
                } else {
                    lockerPasswordDigits.forEach(digitEl => {
                        if (digitEl) digitEl.textContent = '-';
                    });
                }
            } else {
                lockerNumberDisplay.textContent = '-';
                lockerPasswordDigits.forEach(digitEl => {
                    if (digitEl) digitEl.textContent = '-';
                });
            }
        }

        // 4. Reservations
        const resListContainer = document.getElementById('reservation-list-container');
        if (resListContainer) {
            if (data.reservations.length === 0) {
                resListContainer.innerHTML = '<p style="color: var(--grey-500); text-align: center; padding: 2rem;">예약된 일정이 없습니다.</p>';
            } else {
                resListContainer.innerHTML = '';
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
        }
        
        if(window.lucide) lucide.createIcons();
    }

    window.cancelReservation = (id) => {
        if (!confirm('예약을 취소하시겠습니까?\n(취소 시 횟수가 복구됩니다)')) return; 
        
        const data = getGymData();
        const targetRes = data.reservations.find(r => r.id === id);
        
        if (targetRes) {
            data.reservations = data.reservations.filter(r => r.id !== id);
            data.ptCount += 1;
            saveGymData(data);
            alert('예약이 취소되었습니다.');
            renderDashboard();
        }
    };

    // --- Payment Logic ---
    
    const membershipOptions = [];
    for (let i = 1; i <= 12; i++) {
        membershipOptions.push({
            label: `${i}개월`,
            value: i
        });
    }

    const ptOptions = [
        { label: '10회', value: 10, price: 600000 },
        { label: '20회', value: 20, price: 1100000 },
        { label: '30회', value: 30, price: 1500000 } 
    ];

    function updatePaymentOptions() {
        if (!paymentSelect || !paymentSelectLabel) return;
        
        paymentSelect.innerHTML = '';
        const options = currentPaymentType === 'membership' ? membershipOptions : ptOptions;
        paymentSelectLabel.textContent = currentPaymentType === 'membership' ? '기간 선택' : '횟수 선택';

        options.forEach((opt, index) => {
            const el = document.createElement('option');
            el.value = index; 
            
            let displayPrice = 0;
            if (currentPaymentType === 'membership') {
                const months = opt.value;
                displayPrice = (months * 10000) - (Math.floor(months / 3) * 1000);
            } else {
                displayPrice = opt.price;
            }
            
            el.textContent = `${opt.label} (${displayPrice.toLocaleString()}원)`;
            paymentSelect.appendChild(el);
        });
        calculatePrice();
    }

    function calculatePrice() {
        if (!paymentSelect) return;

        const index = paymentSelect.value;
        const options = currentPaymentType === 'membership' ? membershipOptions : ptOptions;
        const selected = options[index];

        if (!selected) return;

        let basePrice = 0;
        let finalPrice = 0;
        let bundleDiscount = 0;

        if (currentPaymentType === 'membership') {
            const months = selected.value;
            const unitPrice = 10000;
            basePrice = months * unitPrice;
            // Bundle Discount: 1000 KRW off for every 3 months
            bundleDiscount = Math.floor(months / 3) * 1000;
            finalPrice = basePrice - bundleDiscount;
        } else {
            basePrice = selected.price;
            finalPrice = selected.price;
        }

        // Check Coupon
        let couponDiscount = 0;
        const code = couponInput ? couponInput.value.trim() : '';
        let couponApplied = false;

        if (code === COUPON_CODE) {
            couponDiscount = finalPrice * 0.2; // 20% off
            if (couponMessage) {
                couponMessage.textContent = '쿠폰이 적용되었습니다! (20% 할인)';
                couponMessage.style.color = '#059669';
            }
            couponApplied = true;
        } else if (code.length > 0) {
            if (couponMessage) {
                couponMessage.textContent = '유효하지 않은 쿠폰 코드입니다.';
                couponMessage.style.color = '#F04452';
            }
        } else {
            if (couponMessage) couponMessage.textContent = '';
        }

        const totalAfterCoupon = finalPrice - couponDiscount;

        // Update UI
        if (basePriceDisplay) basePriceDisplay.textContent = `${basePrice.toLocaleString()}원`;
        
        if (discountRow) {
            if (bundleDiscount > 0) {
                discountRow.style.display = 'flex';
                if (discountAmount) discountAmount.textContent = `-${bundleDiscount.toLocaleString()}원`;
            } else {
                discountRow.style.display = 'none';
            }
        }

        if (couponDiscountRow) {
            if (couponDiscount > 0) {
                couponDiscountRow.style.display = 'flex';
                if (couponDiscountAmount) couponDiscountAmount.textContent = `-${couponDiscount.toLocaleString()}원`;
            } else {
                couponDiscountRow.style.display = 'none';
            }
        }

        if (totalPriceDisplay) totalPriceDisplay.textContent = `${totalAfterCoupon.toLocaleString()}원`;
        return totalAfterCoupon;
    }
}