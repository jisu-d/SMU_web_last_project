// initMyPage를 라우터에서 전역적으로 사용할 수 있도록 설정
window.initMyPage = function() {
    console.log("MyPage Initialized");

    // --- 의존성 확인 ---
    if (typeof MEMBERS === 'undefined' || typeof COUPON_TYPES === 'undefined') {
        console.error("치명적 오류: 데이터베이스(MEMBERS/COUPON_TYPES)가 로드되지 않았습니다.");
        return;
    }

    // --- 전역 상태 관리 ---
    let CURRENT_USER_ID = null;
    let appliedCoupons = [];
    let selectedOptionIndex = null;
    let isPaymentOptionsExpanded = false;

    // --- 헬퍼 함수 ---
    function getMemberData(memberId = CURRENT_USER_ID) {
        if (!memberId || !MEMBERS[memberId]) return null;
        return MEMBERS[memberId];
    }

    function saveMemberData(memberId, data) {
        if (!memberId || !MEMBERS[memberId]) return;
        MEMBERS[memberId] = { ...MEMBERS[memberId], ...data };
        if (memberId === CURRENT_USER_ID) syncToLocalStorage(memberId);
    }

    function syncToLocalStorage(memberId) {
        const userData = MEMBERS[memberId];
        if (!userData) return;
        const gymData = {
            membershipExpire: userData.membershipExpire,
            ptCount: userData.ptCount,
            reservations: userData.reservations,
            lockerNumber: userData.locker ? userData.locker.number : null,
            lockerPassword: userData.locker ? userData.locker.password : null
        };
        localStorage.setItem('gym_data', JSON.stringify(gymData));
    }

    function syncFromLocalStorage(memberId) {
        // 1. 기존 gym_data (예약, 만료일 등) 동기화
        const storedData = localStorage.getItem('gym_data');
        if (storedData && MEMBERS[memberId]) {
            const gymData = JSON.parse(storedData);
            MEMBERS[memberId].ptCount = gymData.ptCount;
            MEMBERS[memberId].reservations = gymData.reservations || [];
            MEMBERS[memberId].membershipExpire = gymData.membershipExpire;
            if (gymData.lockerNumber) {
                MEMBERS[memberId].locker = {
                    number: gymData.lockerNumber,
                    password: gymData.lockerPassword
                };
            }
        }

        // 2. gym_user (쿠폰 정보 등) 동기화
        const storedUser = localStorage.getItem('gym_user');
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                // ID가 일치하는 경우에만 쿠폰 정보 업데이트
                if (userObj.id === memberId && Array.isArray(userObj.coupons)) {
                    MEMBERS[memberId].coupons = userObj.coupons;
                }
            } catch (e) {
                console.warn("gym_user 파싱 실패, 쿠폰 동기화 건너뜀", e);
            }
        }
    }

    function getCurrentUserId() {
        return CURRENT_USER_ID;
    }

    // --- DOM 요소 ---
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
    const paymentOptionsContainer = document.getElementById('payment-options-container');
    const paymentSelectLabel = document.getElementById('payment-select-label');

    const mypageBottomBar = document.getElementById('mypage-bottom-bar');
    const mypageSummaryText = document.getElementById('mypage-summary-text');
    const mypageSummaryPrice = document.getElementById('mypage-summary-price');

    const receiptModal = document.getElementById('receipt-modal');
    const receiptItemName = document.getElementById('receipt-item-name');
    const receiptBasePrice = document.getElementById('receipt-base-price');
    const receiptDiscountRow = document.getElementById('receipt-discount-row');
    const receiptDiscountAmount = document.getElementById('receipt-discount-amount');
    const receiptCouponsList = document.getElementById('receipt-coupons-list');
    const receiptFinalPrice = document.getElementById('receipt-final-price');
    const cancelReceiptBtn = document.getElementById('cancel-receipt-btn');
    const finalPayBtn = document.getElementById('final-pay-btn');

    // 사물함 요소
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

    let currentPaymentType = 'membership';

    // --- 이벤트 리스너 ---

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
            // 테스트 계정 자동 로그인
            document.getElementById('userId').value = 'user123';
            document.getElementById('password').value = '1234';
            // 폼 제출 트리거 또는 직접 로그인 함수 호출
            if (MEMBERS['user123']) {
                loginSuccess('user123');
            }
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            CURRENT_USER_ID = null;
            localStorage.removeItem('gym_user');
            appliedCoupons = [];
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
            selectedOptionIndex = null;
            isPaymentOptionsExpanded = false; 
            updatePaymentOptions();
        };
    });

    if (applyCouponBtn) applyCouponBtn.onclick = applyCoupon;
    
    if (confirmPaymentBtn) confirmPaymentBtn.onclick = showReceiptModal;
    if (finalPayBtn) finalPayBtn.onclick = processActualPayment;
    if (cancelReceiptBtn) cancelReceiptBtn.onclick = () => {
        if(receiptModal) receiptModal.style.display = 'none';
    };

    setupLockerEvents();

    // --- 핵심 함수 ---

    function loginSuccess(id) {
        CURRENT_USER_ID = id;
        
        // gym_user에 전체 유저 객체를 JSON 문자열로 저장 (다른 페이지에서 참조용)
        const userObj = { ...MEMBERS[id] };
        // id 필드도 편의상 추가
        userObj.id = id;
        
        localStorage.setItem('gym_user', JSON.stringify(userObj));
        
        syncToLocalStorage(id);
        appliedCoupons = [];
        if (window.updateHeaderState) window.updateHeaderState();
        showMain();
    }

    function showLogin() {
        viewLogin.classList.add('active');
        viewMain.classList.remove('active');
        viewPayment.classList.remove('active');
        if(mypageBottomBar) mypageBottomBar.style.display = 'none';
    }

    function showMain() {
        viewLogin.classList.remove('active');
        viewMain.classList.add('active');
        viewPayment.classList.remove('active');
        if(mypageBottomBar) mypageBottomBar.style.display = 'none';
        if(receiptModal) receiptModal.style.display = 'none';
        renderDashboard();
    }

    function showPayment() {
        viewMain.classList.remove('active');
        viewPayment.classList.add('active');
        if(mypageBottomBar) mypageBottomBar.style.display = 'flex';
        
        const pendingPayment = sessionStorage.getItem('pendingPayment');
        const pendingCoupon = sessionStorage.getItem('pendingCoupon');

        if (couponInput) couponInput.value = '';
        if (couponMessage) couponMessage.textContent = '';
        appliedCoupons = []; 
        selectedOptionIndex = null;
        isPaymentOptionsExpanded = false;

        if (pendingPayment && pendingCoupon) {
            sessionStorage.removeItem('pendingPayment');
            sessionStorage.removeItem('pendingCoupon');
            if (couponInput) couponInput.value = pendingCoupon;
            applyCoupon();
        }

        renderAppliedCoupons();
        
        const cashRadio = document.querySelector('input[name="payment-method"][value="cash"]');
        if (cashRadio) cashRadio.checked = true;
        
        updatePaymentOptions();
    }

    function createResItem(res, isHistory) {
        const item = document.createElement('div');
        item.className = 'reservation-item';
        if (isHistory) {
            item.style.backgroundColor = '#f9fafb';
            item.style.opacity = '0.8';
        }
        
        let actionBtn = '';
        if (!isHistory) {
            actionBtn = `
                <button class="btn btn-outline btn-sm" onclick="cancelReservation(${res.id})" 
                    style="color: #F04452; border-color: rgba(240, 68, 82, 0.3); background-color: rgba(240, 68, 82, 0.05);">
                    취소
                </button>
            `;
        } else {
            actionBtn = `<span style="font-size: 0.85rem; color: var(--grey-500);">이용 완료</span>`;
        }

        item.innerHTML = `
            <div class="reservation-info">
                <div class="reservation-date">
                    <i data-lucide="calendar" style="width: 1rem; height: 1rem; color: ${isHistory ? 'var(--grey-400)' : 'var(--brand-blue)'};
                    "></i>
                    ${res.date} <span style="color: var(--grey-300);">|</span> ${res.time}
                </div>
                <div class="reservation-trainer">
                    <i data-lucide="user" style="width: 0.9rem; height: 0.9rem;"></i>
                    ${res.trainer} 트레이너
                </div>
            </div>
            ${actionBtn}
        `;
        return item;
    }

    function renderDashboard() {
        const data = getMemberData();
        if (!data) return;

        const nameEl = document.getElementById('member-name');
        const contactEl = document.getElementById('member-contact');
        if (nameEl) nameEl.textContent = data.name;
        if (contactEl) contactEl.textContent = data.contact;

        const expireEl = document.getElementById('expire-date-display');
        if (expireEl) {
            if (data.membershipExpire) {
                const today = new Date();
                const expireAt = new Date(data.membershipExpire);
                today.setHours(0,0,0,0); expireAt.setHours(0,0,0,0);
                if (expireAt >= today) {
                    const diffDays = Math.ceil((expireAt - today) / (1000 * 60 * 60 * 24));
                    expireEl.textContent = `${diffDays}일 남았습니다.`; 
                    expireEl.style.color = 'var(--brand-blue)';
                } else {
                    expireEl.textContent = '만료됨';
                    expireEl.style.color = '#F04452';
                }
            } else {
                expireEl.textContent = '이용권 없음';
                expireEl.style.color = '#F04452';
            }
        }

        const ptCountEl = document.getElementById('pt-count-display');
        if (ptCountEl) ptCountEl.textContent = data.ptCount;

        // 사물함 로직 (신규 등록 기능)
        const lockerInfoSection = document.getElementById('locker-info-section');
        const lockerRegisterSection = document.getElementById('locker-register-section');
        const editLockerBtn = document.getElementById('edit-locker-btn');
        const registerLockerBtn = document.getElementById('register-locker-btn');

        if (lockerInfoSection && lockerRegisterSection) {
            if (data.locker && data.locker.number) {
                // 사물함 보유 중 -> 정보 표시
                lockerInfoSection.style.display = 'flex';
                lockerRegisterSection.style.display = 'none';
                if (editLockerBtn) editLockerBtn.style.display = 'flex';

                // 디스플레이 업데이트
                if (lockerNumberDisplay) {
                    lockerNumberDisplay.textContent = `${data.locker.number}번`;
                    const pw = data.locker.password || '';
                    lockerPasswordDigits.forEach((el, i) => { if(el) el.textContent = pw[i] || '-'; });
                }
            } else {
                // 사물함 없음 -> 등록 버튼 표시
                lockerInfoSection.style.display = 'none';
                lockerRegisterSection.style.display = 'block';
                if (editLockerBtn) editLockerBtn.style.display = 'none';

                // 클릭 이벤트 바인딩
                if (registerLockerBtn) {
                    registerLockerBtn.onclick = () => {
                        const randLocker = Math.floor(Math.random() * 50) + 1;
                        const defaultPw = '0000';
                        
                        saveMemberData(CURRENT_USER_ID, { 
                            locker: { number: randLocker, password: defaultPw } 
                        });
                        
                        alert(`🎉 사물함 ${randLocker}번이 배정되었습니다.\n초기 비밀번호: ${defaultPw}`);
                        renderDashboard(); // UI 갱신
                    };
                }
            }
        }

        // 예약 로직 (기록 분리)
        const resListContainer = document.getElementById('reservation-list-container');
        const resHistoryListEl = document.getElementById('reservation-history-list'); 
        const viewHistoryBtn = document.getElementById('view-res-history-btn');

        if (resListContainer) {
            resListContainer.innerHTML = '';
            if (resHistoryListEl) resHistoryListEl.innerHTML = '';

            if (!data.reservations || data.reservations.length === 0) {
                resListContainer.innerHTML = '<p style="color: var(--grey-500); text-align: center; padding: 2rem;">예약된 일정이 없습니다.</p>';
                if(viewHistoryBtn) viewHistoryBtn.style.display = 'none';
            } else {
                const now = new Date();
                const upcoming = [];
                const past = [];

                data.reservations.forEach(res => {
                    // 단순 날짜 비교. 형식 YYYY-MM-DD HH:MM
                    const resDate = new Date(`${res.date}T${res.time}`);
                    if (resDate < now) past.push(res);
                    else upcoming.push(res);
                });

                // 예정된 예약 렌더링
                if (upcoming.length === 0) {
                    resListContainer.innerHTML = '<p style="color: var(--grey-500); text-align: center; padding: 2rem;">예정된 일정이 없습니다.</p>';
                    resListContainer.classList.remove('reservation-list--scrollable'); // 항목이 없으면 클래스 제거
                } else {
                    // 오름차순 정렬
                    upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
                    upcoming.forEach(res => {
                        resListContainer.appendChild(createResItem(res, false));
                    });

                    // 예정된 예약이 2개 이상인 경우 스크롤 가능 클래스 추가
                    if (upcoming.length > 2) {
                        resListContainer.classList.add('reservation-list--scrollable');
                    } else {
                        resListContainer.classList.remove('reservation-list--scrollable');
                    }
                }

                // 지난 예약 렌더링
                if (past.length > 0 && resHistoryListEl) {
                    if(viewHistoryBtn) {
                        viewHistoryBtn.style.display = 'flex';
                        // 이벤트 리스너 중복 방지를 위해 덮어쓰기
                        viewHistoryBtn.onclick = () => {
                            const isHidden = resHistoryListEl.style.display === 'none';
                            resHistoryListEl.style.display = isHidden ? 'flex' : 'none';
                            resHistoryListEl.style.flexDirection = 'column';
                            resHistoryListEl.style.gap = '0.75rem';
                            
                            const icon = viewHistoryBtn.querySelector('svg');
                            if(icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
                            if(icon) icon.style.transition = 'transform 0.2s';
                        };
                    }
                    // 내림차순 정렬
                    past.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
                    past.forEach(res => {
                        resHistoryListEl.appendChild(createResItem(res, true));
                    });
                } else {
                    if(viewHistoryBtn) viewHistoryBtn.style.display = 'none';
                }
            }
        }
        if(window.lucide) lucide.createIcons();
    }

    // --- 데이터 ---
    const membershipOptions = Array.from({length: 12}, (_, i) => ({ label: `${i+1}개월`, value: i+1 }));
    const ptOptions = [
        { label: '10회', value: 10, price: 600000 },
        { label: '20회', value: 20, price: 1100000 },
        { label: '30회', value: 30, price: 1500000 }
    ];

    function updatePaymentOptions() {
        if (!paymentOptionsContainer) return;
        paymentOptionsContainer.innerHTML = ''; 
        
        const isMembership = currentPaymentType === 'membership';
        const options = isMembership ? membershipOptions : ptOptions;
        
        if (paymentSelectLabel) paymentSelectLabel.textContent = isMembership ? '기간 선택' : '횟수 선택';

        // 선택된 것이 없으면 강제 확장
        if (selectedOptionIndex === null) {
             isPaymentOptionsExpanded = true;
        }

        if (isPaymentOptionsExpanded) {
            paymentOptionsContainer.classList.remove('collapsed');
            paymentOptionsContainer.style.gridTemplateColumns = '1fr';
        } else {
            paymentOptionsContainer.classList.add('collapsed');
            paymentOptionsContainer.style.gridTemplateColumns = '1fr 48px';
        }

        if (isPaymentOptionsExpanded) {
            options.forEach((opt, index) => {
                const card = createOptionCard(opt, index, isMembership);
                paymentOptionsContainer.appendChild(card);
            });
        } else {
            // 유효한 선택이 있는 경우에만 렌더링
            if (selectedOptionIndex !== null && options[selectedOptionIndex]) {
                const selectedOpt = options[selectedOptionIndex];
                const card = createOptionCard(selectedOpt, selectedOptionIndex, isMembership);
                paymentOptionsContainer.appendChild(card);

                const toggleBtn = document.createElement('div');
                toggleBtn.className = 'payment-toggle-btn';
                toggleBtn.innerHTML = '<i data-lucide="chevron-down"></i>';
                toggleBtn.onclick = () => {
                    isPaymentOptionsExpanded = true;
                    updatePaymentOptions();
                };
                paymentOptionsContainer.appendChild(toggleBtn);
            } else {
                // 대체 동작 (강제 확장으로 인해 발생하지 않아야 하지만 안전을 위해)
                isPaymentOptionsExpanded = true;
                updatePaymentOptions(); 
                return;
            }
        }

        calculatePrice();
        if(window.lucide) lucide.createIcons();
    }

    function createOptionCard(opt, index, isMembership) {
        const card = document.createElement('div');
        card.className = `payment-option-card ${selectedOptionIndex === index ? 'selected' : ''}`;
        
        let displayPrice = 0;
        if (isMembership) {
            const base = opt.value * 10000;
            const discount = Math.floor(opt.value / 3) * 1000;
            displayPrice = base - discount;
        } else {
            displayPrice = opt.price;
        }

        card.innerHTML = `
            <div class="payment-option-label">${opt.label}</div>
            <div class="payment-option-price">${displayPrice.toLocaleString()}원</div>
        `;

        card.onclick = () => {
            selectedOptionIndex = index;
            if (isPaymentOptionsExpanded) {
                isPaymentOptionsExpanded = false;
                updatePaymentOptions();
            } else {
                isPaymentOptionsExpanded = true;
                updatePaymentOptions();
            }
        };
        return card;
    }

    function applyCoupon() {
        const code = couponInput.value.trim();
        if (!code) return;
        if (!COUPON_TYPES[code]) { setMessage('존재하지 않는 쿠폰 코드입니다.', '#F04452'); return; }
        const userData = getMemberData();
        if (!userData.coupons.includes(code)) { setMessage('보유하고 있지 않은 쿠폰입니다.', '#F04452'); return; }
        if (appliedCoupons.includes(code)) { setMessage('이미 적용된 쿠폰입니다.', '#F04452'); return; }
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

    function calculateData() {
        const isMembership = currentPaymentType === 'membership';
        const options = isMembership ? membershipOptions : ptOptions;
        const selected = options[selectedOptionIndex];
        
        if (!selected) return null;

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
        let couponDiscounts = [];

        appliedCoupons.forEach(code => {
            const coupon = COUPON_TYPES[code];
            let discount = 0;
            if (coupon.type === 'fixed') {
                discount = coupon.value;
            } else if (coupon.type === 'percent') {
                discount = finalPrice * (coupon.value / 100);
            }
            totalCouponDiscount += discount;
            couponDiscounts.push({ name: coupon.name, amount: discount });
        });

        const priceAfterCoupons = Math.max(0, finalPrice - totalCouponDiscount);

        return {
            selected,
            basePrice,
            bundleDiscount,
            couponDiscounts,
            finalPrice: priceAfterCoupons
        };
    }

    function calculatePrice() {
        const data = calculateData();
        if (!data) {
            if (confirmPaymentBtn) confirmPaymentBtn.disabled = true;
            if (mypageSummaryText) mypageSummaryText.textContent = '상품을 선택해주세요';
            if (mypageSummaryPrice) mypageSummaryPrice.style.display = 'none';
            return;
        }

        const typeName = currentPaymentType === 'membership' ? '헬스' : 'PT';
        if (mypageSummaryText) mypageSummaryText.textContent = `${typeName} ${data.selected.label}`;
        if (mypageSummaryPrice) {
            mypageSummaryPrice.textContent = `${Math.floor(data.finalPrice).toLocaleString()}원`;
            mypageSummaryPrice.style.display = 'inline';
        }
        if (confirmPaymentBtn) confirmPaymentBtn.disabled = false;
    }

    function showReceiptModal() {
        if (confirmPaymentBtn && confirmPaymentBtn.disabled) return;

        const data = calculateData();
        if (!data) return;

        const typeName = currentPaymentType === 'membership' ? '헬스' : 'PT';
        
        if (receiptItemName) receiptItemName.textContent = `${typeName} ${data.selected.label}`;
        if (receiptBasePrice) receiptBasePrice.textContent = `${data.basePrice.toLocaleString()}원`;
        
        if (receiptDiscountRow) {
            if (data.bundleDiscount > 0) {
                receiptDiscountRow.style.display = 'flex';
                if (receiptDiscountAmount) receiptDiscountAmount.textContent = `-${data.bundleDiscount.toLocaleString()}원`;
            } else {
                receiptDiscountRow.style.display = 'none';
            }
        }

        if (receiptCouponsList) {
            receiptCouponsList.innerHTML = '';
            data.couponDiscounts.forEach(c => {
                const row = document.createElement('div');
                row.style.cssText = 'display: flex; justify-content: space-between; color: #F04452; font-size: 0.95rem;';
                row.innerHTML = `<span>${c.name}</span><span>-${Math.floor(c.amount).toLocaleString()}원</span>`;
                receiptCouponsList.appendChild(row);
            });
        }

        if (receiptFinalPrice) receiptFinalPrice.textContent = `${Math.floor(data.finalPrice).toLocaleString()}원`;

        if (receiptModal) receiptModal.style.display = 'flex';
    }

    function processActualPayment() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedMethod) {
            alert('결제 방법을 선택해주세요.');
            return;
        }

        const data = calculateData();
        if (!data) {
            alert('이용권(기간/횟수)을 선택해주세요.');
            return;
        }

        const userData = getMemberData();

        if (currentPaymentType === 'membership') {
            const selected = data.selected;
            let newExpire = new Date();
            if (userData.membershipExpire) {
                const currentExpire = new Date(userData.membershipExpire);
                if (currentExpire > new Date()) newExpire = currentExpire;
            }
            newExpire.setMonth(newExpire.getMonth() + selected.value);
            saveMemberData(CURRENT_USER_ID, { membershipExpire: newExpire.toISOString().split('T')[0] });
        } else {
            const selected = data.selected;
            saveMemberData(CURRENT_USER_ID, { ptCount: userData.ptCount + selected.value });
        }

        // 사용된 쿠폰 제거
        const remainingCoupons = userData.coupons.filter(c => !appliedCoupons.includes(c));
        saveMemberData(CURRENT_USER_ID, { coupons: remainingCoupons });

        alert('결제가 완료되었습니다.');
        if (receiptModal) receiptModal.style.display = 'none';
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

    // --- 전역 내보내기 ---
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
        saveMemberData(CURRENT_USER_ID, { reservations: newRes, ptCount: data.ptCount + 1 });
        alert('예약 취소됨 (PT 1회 복구)');
        renderDashboard();
    };

    // --- 초기화 ---
    let storedUser = localStorage.getItem('gym_user');
    
    // 저장된 값이 JSON 객체인지 일반 문자열(ID)인지 확인
    let userId = null;
    if (storedUser) {
        if (storedUser.startsWith('{')) {
            try {
                const parsed = JSON.parse(storedUser);
                userId = parsed.id || parsed.name; // ID 필드가 없으면 이름 등을 대신 사용 (보완 필요)
                // 하지만 MEMBERS 키는 ID이므로, 저장 시 ID를 포함시켰는지 확인해야 함.
                // 위 loginSuccess 수정에서 id를 포함시켰으므로 parsed.id 사용
                
                // 만약 id가 없다면(구조 변경 전 데이터), 키를 역추적하거나 로그아웃 처리
                if (!userId) {
                    // MEMBERS에서 매칭되는 유저 찾기 (이름/연락처 등)
                    for(const key in MEMBERS) {
                        if(MEMBERS[key].name === parsed.name) {
                            userId = key;
                            break;
                        }
                    }
                }
            } catch (e) {
                console.error("User parse error", e);
                localStorage.removeItem('gym_user');
            }
        } else {
            // 구버전: 단순히 ID 문자열만 저장된 경우
            userId = storedUser;
            // 신버전 포맷으로 마이그레이션
            if (MEMBERS[userId]) {
                const userObj = { ...MEMBERS[userId], id: userId };
                localStorage.setItem('gym_user', JSON.stringify(userObj));
            }
        }
    }

    if (userId && MEMBERS[userId]) {
        CURRENT_USER_ID = userId;
        syncFromLocalStorage(CURRENT_USER_ID);
        if (window.updateHeaderState) window.updateHeaderState();
        showMain();
    } else {
        showLogin();
    }
};
