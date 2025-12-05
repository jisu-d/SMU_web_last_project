// 회원 데이터 (로컬 스토리지 사용 안 함)
const MEMBERS = [
    {
        id: "user123",
        password: "1234",
        name: "홍길동",
        contact: "010-1234-5678",
        email: "hong@example.com",
        membershipExpireDate: "2024-12-31", // YYYY-MM-DD 형식
        lockerNumber: 42,
        lockerPassword: "1357"
    },
    {
        id: "admin",
        password: "admin",
        name: "관리자",
        contact: "010-9876-5432",
        email: "admin@example.com",
        membershipExpireDate: "2025-12-31",
        lockerNumber: 1,
        lockerPassword: "2468"
    }
];

// --- Load Locker Module ---
(function loadLockerModule() {
    if (!document.querySelector('script[src="mypage/modules/locker.js"]')) {
        const script = document.createElement('script');
        script.src = 'mypage/modules/locker.js';
        document.body.appendChild(script);
    }
})();
// -------------------------

// 쿠폰 데이터 (mon: 할인율(%))
const COUPONS = [
    { code: "X-mas", mon: 30 }, // 30% 할인
    { code: "WELCOME", mon: 10 }, // 10% 할인
    { code: "NEWYEAR", mon: 20 }  // 20% 할인 (예시 추가)
];

let loggedInUser = null; // 현재 로그인된 사용자 정보 객체
let appliedCoupons = []; // 현재 적용된 쿠폰 목록 (객체 배열)

// DOM 요소 캐싱 (재할당 가능하도록 let 사용)
let viewLogin = null;
let viewMain = null;
let viewPayment = null;
let loginForm = null;
let userIdInput = null;
let passwordInput = null;
let loginButton = null;
let logoutBtn = null;
let testAccountFillBtn = null;
let cancelPaymentBtn = null;

// 개인 정보 표시 요소
let memberNameElem = null;
let memberIdElem = null;
let memberContactElem = null;
let memberEmailElem = null;

// 등록 현황 표시 요소
let expireDateDisplayElem = null;
let daysRemainingTextElem = null;

// 사물함 정보 표시 요소
let lockerNumberDisplayElem = null;
let lockerPasswordDigit1Elem = null;
let lockerPasswordDigit2Elem = null;
let lockerPasswordDigit3Elem = null;
let lockerPasswordDigit4Elem = null;

// 결제 관련 요소
let monthSelect = null;
let baseMonthDisplay = null;
let basePriceDisplay = null;
let discountRow = null;
let discountCountElem = null;
let discountAmountElem = null;
let couponRow = null;
let couponRateDisplay = null;
let couponAmountElem = null;
let totalPriceDisplay = null;
let couponInput = null;
let applyCouponBtn = null;
let appliedCouponsContainer = null;
let confirmPaymentBtn = null;


/**
 * 로그인 처리 함수
 * @param {string} id - 사용자 ID
 * @param {string} pw - 비밀번호
 */
function login(id, pw) {
    // console.log("Attempting login with ID:", id, "Password:", pw); // Debug log
    const trimmedId = id.trim();
    const trimmedPw = pw.trim();
    const user = MEMBERS.find(member => member.id === trimmedId && member.password === trimmedPw);
    // console.log("Found user:", user); // Debug log
    if (user) {
        loggedInUser = user;
        // 로컬 스토리지에 사용자 정보 저장 (로그인 유지)
        localStorage.setItem('user', JSON.stringify(user));
        
        // 헤더 UI 업데이트 (로그인 -> 마이페이지)
        if (window.updateHeaderState) window.updateHeaderState();

        // 결제 대기 상태 확인
        if (sessionStorage.getItem('pendingPayment') === 'true') {
            checkPendingPayment();
        } else {
            showView("main");
        }
        
        displayMemberInfo(loggedInUser); // 로그인 성공 시 회원 정보 표시
        alert(`${loggedInUser.name}님 환영합니다!`);
    } else {
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
        loggedInUser = null;
    }
}

/**
 * 로그아웃 처리 함수
 */
function logout() {
    loggedInUser = null;
    localStorage.removeItem('user'); // 세션 삭제
    
    // 헤더 UI 업데이트 (마이페이지 -> 로그인)
    if (window.updateHeaderState) window.updateHeaderState();
    
    showView("login");
    alert("로그아웃되었습니다.");
    // 로그인 폼 초기화
    if (loginForm) {
        loginForm.reset();
    }
    resetPaymentForm();
}

/**
 * 뷰 전환 함수
 * @param {string} viewName - "login" 또는 "main" 또는 "payment"
 */
function showView(viewName) {
    // 모든 뷰 비활성화
    viewLogin.classList.remove("active");
    viewMain.classList.remove("active");
    viewPayment.classList.remove("active");

    // 선택된 뷰만 활성화
    if (viewName === "login") {
        viewLogin.classList.add("active");
    } else if (viewName === "main") {
        viewMain.classList.add("active");
    } else if (viewName === "payment") {
        viewPayment.classList.add("active");
        // 결제 화면 진입 시 폼 초기화 및 가격 계산
        resetPaymentForm();
        calculateTotal();
    }
}

/**
 * 로그인 상태 확인 및 UI 렌더링
 */
function checkLoginStatusAndRenderUI() {
    // 초기 로드 시에는 로그인 상태가 없으므로 항상 로그인 뷰를 표시
    showView("login");
}


/**
 * 로그인한 사용자의 정보를 view-main에 동적으로 표시하는 함수
 * @param {Object} member - 로그인한 사용자 객체
 */
function displayMemberInfo(member) {
    // 개인 정보
    if (memberNameElem) memberNameElem.textContent = member.name;
    if (memberIdElem) memberIdElem.textContent = member.id;
    if (memberContactElem) memberContactElem.textContent = member.contact;
    if (memberEmailElem) memberEmailElem.textContent = member.email;

    // 등록 현황
    if (expireDateDisplayElem) {
        expireDateDisplayElem.textContent = member.membershipExpireDate.replace(/-/g, '. '); // YYYY-MM-DD -> YYYY. MM. DD.
    }

    if (daysRemainingTextElem) {
        const today = new Date();
        // 시간을 00:00:00으로 맞춰서 날짜만 비교하도록 설정
        today.setHours(0, 0, 0, 0);
        
        const expireDate = new Date(member.membershipExpireDate);
        expireDate.setHours(0, 0, 0, 0);

        // 날짜 차이 계산
        const diffTime = expireDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 밀리초를 일수로 변환
        
        // 부모 요소(배경 컨테이너) 가져오기
        const container = daysRemainingTextElem.parentElement;

        if (diffDays < 0) {
            daysRemainingTextElem.textContent = "회원권이 만료되었습니다.";
            daysRemainingTextElem.style.color = "#dc2626"; // 빨간색 텍스트
            if (container) container.style.backgroundColor = "#fef2f2"; // 연한 빨간색 배경
        } else {
            daysRemainingTextElem.textContent = `회원권이 ${diffDays}일 남았습니다.`;
            daysRemainingTextElem.style.color = "#2563eb"; // 기본 파란색 텍스트
            if (container) container.style.backgroundColor = "#eff6ff"; // 연한 파란색 배경
        }
    }

    // 사물함 정보
    if (lockerNumberDisplayElem) {
        lockerNumberDisplayElem.textContent = `${member.lockerNumber}번`;
    }

    if (member.lockerPassword) {
        const passwordDigits = member.lockerPassword.split('');
        if (lockerPasswordDigit1Elem) lockerPasswordDigit1Elem.textContent = passwordDigits[0] || '';
        if (lockerPasswordDigit2Elem) lockerPasswordDigit2Elem.textContent = passwordDigits[1] || '';
        if (lockerPasswordDigit3Elem) lockerPasswordDigit3Elem.textContent = passwordDigits[2] || '';
        if (lockerPasswordDigit4Elem) lockerPasswordDigit4Elem.textContent = passwordDigits[3] || '';
    }
}

/**
 * 결제 금액 계산 함수
 */
function calculateTotal() {
    const months = parseInt(monthSelect.value);
    
    // 1. 기본 금액 계산 (1개월 = 10,000원)
    const basePrice = months * 10000;
    
    // 2. 기간 할인 계산 (3개월 단위로 1,000원 할인)
    const discountCount = Math.floor(months / 3);
    const discountPrice = discountCount * 1000;
    
    // 3. 중간 합계 (쿠폰 적용 전)
    let subTotal = basePrice - discountPrice;
    
    // 4. 쿠폰 할인 계산 (중간 합계에 대해 % 할인 합산)
    // 여러 쿠폰의 할인율을 합산 (최대 100% 제한)
    let totalCouponRate = appliedCoupons.reduce((sum, coupon) => sum + coupon.mon, 0);
    if (totalCouponRate > 100) totalCouponRate = 100;

    const couponDiscountPrice = Math.floor(subTotal * (totalCouponRate / 100));
    
    // 5. 최종 금액
    const totalPrice = subTotal - couponDiscountPrice;
    
    // UI 업데이트
    baseMonthDisplay.textContent = months;
    basePriceDisplay.textContent = basePrice.toLocaleString() + "원";
    
    if (discountCount > 0) {
        discountRow.style.display = "flex";
        discountCountElem.textContent = `${discountCount}회 (${discountCount * 3}개월)`;
        discountAmountElem.textContent = "-" + discountPrice.toLocaleString() + "원";
    } else {
        discountRow.style.display = "none";
    }
    
    if (totalCouponRate > 0) {
        couponRow.style.display = "flex";
        couponRateDisplay.textContent = totalCouponRate; // 합산된 할인율 표시
        couponAmountElem.textContent = "-" + couponDiscountPrice.toLocaleString() + "원";
    } else {
        couponRow.style.display = "none";
    }
    
    totalPriceDisplay.textContent = totalPrice.toLocaleString() + "원";
}

/**
 * 적용된 쿠폰을 UI에 렌더링하는 함수
 */
function renderAppliedCoupons() {
    // 기존 내용 초기화
    appliedCouponsContainer.innerHTML = "";

    if (appliedCoupons.length === 0) {
        appliedCouponsContainer.style.display = "none";
        return;
    }

    appliedCouponsContainer.style.display = "flex";
    
    appliedCoupons.forEach((coupon, index) => {
        const tag = document.createElement("div");
        tag.className = "mypage-coupon-tag";
        tag.innerHTML = `
            <span>${coupon.code} (-${coupon.mon}%)</span>
            <button type="button" class="remove-coupon-btn" data-index="${index}">&times;</button>
        `;
        appliedCouponsContainer.appendChild(tag);
    });

    // 삭제 버튼 이벤트 리스너 추가
    const removeBtns = appliedCouponsContainer.querySelectorAll(".remove-coupon-btn");
    removeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-index"));
            removeCoupon(index);
        });
    });
}

/**
 * 쿠폰 삭제 함수
 * @param {number} index - 삭제할 쿠폰의 인덱스
 */
function removeCoupon(index) {
    appliedCoupons.splice(index, 1);
    renderAppliedCoupons();
    calculateTotal();
}


/**
 * 결제 폼 초기화 함수
 */
function resetPaymentForm() {
    monthSelect.value = "1";
    couponInput.value = "";
    appliedCoupons = []; // 쿠폰 목록 초기화
    renderAppliedCoupons();
    calculateTotal();
}


/**
 * 결제 대기 상태 확인 및 처리 함수
 */
function checkPendingPayment() {
    if (sessionStorage.getItem('pendingPayment') === 'true') {
        showView('payment');
        
        const couponCode = sessionStorage.getItem('pendingCoupon');
        if (couponCode) {
            const couponInput = document.getElementById('coupon-input');
            if (couponInput) {
                couponInput.value = couponCode;
                
                // 쿠폰 적용 버튼 클릭 트리거
                const applyBtn = document.getElementById('apply-coupon-btn');
                if (applyBtn) {
                    applyBtn.click();
                }
            }
        }
        
        // 처리 후 플래그 삭제
        sessionStorage.removeItem('pendingPayment');
        sessionStorage.removeItem('pendingCoupon');
    }
}

// 페이지 로드 시 실행될 초기화 함수
window.initMyPage = function() {
    // Locker Modal Events (Using LockerManager Module)
    const editLockerBtn = document.getElementById("edit-locker-btn");
    const closeLockerModalBtn = document.getElementById("close-locker-modal-btn");
    const cancelLockerBtn = document.getElementById("cancel-locker-btn");
    const saveLockerBtn = document.getElementById("save-locker-btn");

    if (editLockerBtn) {
        editLockerBtn.addEventListener("click", () => {
            if (window.LockerManager) {
                window.LockerManager.openModal(loggedInUser, MEMBERS);
            } else {
                console.error("LockerManager module not loaded");
            }
        });
    }
    
    if (closeLockerModalBtn) {
        closeLockerModalBtn.addEventListener("click", () => {
            if (window.LockerManager) window.LockerManager.closeModal();
        });
    }
    
    if (cancelLockerBtn) {
        cancelLockerBtn.addEventListener("click", () => {
            if (window.LockerManager) window.LockerManager.closeModal();
        });
    }
    
    if (saveLockerBtn) {
        saveLockerBtn.addEventListener("click", () => {
            if (window.LockerManager) {
                window.LockerManager.saveInfo(loggedInUser, MEMBERS, (updatedUser) => {
                    displayMemberInfo(updatedUser);
                });
            }
        });
    }

    // Lucide Icons 초기화
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- DOM 요소 최신화 (Global Variables Update) ---
    viewLogin = document.getElementById("view-login");
    viewMain = document.getElementById("view-main");
    viewPayment = document.getElementById("view-payment");
    loginForm = document.getElementById("login-form");
    userIdInput = document.getElementById("userId");
    passwordInput = document.getElementById("password");
    loginButton = document.getElementById("login-button");
    logoutBtn = document.getElementById("logout-btn");
    testAccountFillBtn = document.getElementById("test-account-fill-btn");
    cancelPaymentBtn = document.getElementById("cancel-payment-btn");

    memberNameElem = document.getElementById("member-name");
    memberIdElem = document.getElementById("member-id");
    memberContactElem = document.getElementById("member-contact");
    memberEmailElem = document.getElementById("member-email");

    expireDateDisplayElem = document.getElementById("expire-date-display");
    daysRemainingTextElem = document.getElementById("days-remaining-text");

    lockerNumberDisplayElem = document.getElementById("locker-number-display");
    lockerPasswordDigit1Elem = document.getElementById("locker-password-digit-1");
    lockerPasswordDigit2Elem = document.getElementById("locker-password-digit-2");
    lockerPasswordDigit3Elem = document.getElementById("locker-password-digit-3");
    lockerPasswordDigit4Elem = document.getElementById("locker-password-digit-4");

    monthSelect = document.getElementById("month-select");
    baseMonthDisplay = document.getElementById("base-month-display");
    basePriceDisplay = document.getElementById("base-price-display");
    discountRow = document.getElementById("discount-row");
    discountCountElem = document.getElementById("discount-count");
    discountAmountElem = document.getElementById("discount-amount");
    couponRow = document.getElementById("coupon-row");
    couponRateDisplay = document.getElementById("coupon-rate-display");
    couponAmountElem = document.getElementById("coupon-amount");
    totalPriceDisplay = document.getElementById("total-price-display");
    couponInput = document.getElementById("coupon-input");
    applyCouponBtn = document.getElementById("apply-coupon-btn");
    appliedCouponsContainer = document.getElementById("applied-coupons-container");
    confirmPaymentBtn = document.getElementById("confirm-payment-btn");
    // ---------------------------------------------------

    // 로그인 버튼 클릭 이벤트
    if (loginButton) {
        // Clone to remove old listeners
        const newLoginBtn = loginButton.cloneNode(true);
        loginButton.parentNode.replaceChild(newLoginBtn, loginButton);
        loginButton = newLoginBtn; // Update global ref

        loginButton.addEventListener("click", (e) => {
            e.preventDefault(); 
            const id = userIdInput.value;
            const pw = passwordInput.value;
            login(id, pw);
        });
    }

    // 로그아웃 버튼 클릭 이벤트
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        logoutBtn = newLogoutBtn;

        logoutBtn.addEventListener("click", logout);
    }

    // 테스트 계정 자동 채우기 버튼 이벤트
    if (testAccountFillBtn) {
        const newTestBtn = testAccountFillBtn.cloneNode(true);
        testAccountFillBtn.parentNode.replaceChild(newTestBtn, testAccountFillBtn);
        testAccountFillBtn = newTestBtn;

        testAccountFillBtn.addEventListener("click", () => {
            userIdInput.value = "user123";
            passwordInput.value = "1234";
        });
    }

    // 결제 화면 이동 버튼 이벤트
    const toPaymentBtns = document.querySelectorAll(".to-payment-btn");
    toPaymentBtns.forEach(btn => {
        // Note: Cloning node removes listeners but for class-based selection 
        // we are iterating. Since these elements are newly created by router,
        // we don't strictly need to remove old listeners (they are gone with old DOM).
        // Just adding new ones is fine.
        btn.addEventListener("click", () => {
            showView("payment");
        });
    });

    // 결제 취소 버튼 이벤트
    if (cancelPaymentBtn) {
        const newCancelBtn = cancelPaymentBtn.cloneNode(true);
        cancelPaymentBtn.parentNode.replaceChild(newCancelBtn, cancelPaymentBtn);
        cancelPaymentBtn = newCancelBtn;

        cancelPaymentBtn.addEventListener("click", () => {
            showView("main");
        });
    }

    // 개월 수 변경 이벤트
    if (monthSelect) {
        const newMonthSelect = monthSelect.cloneNode(true);
        monthSelect.parentNode.replaceChild(newMonthSelect, monthSelect);
        monthSelect = newMonthSelect;

        monthSelect.addEventListener("change", calculateTotal);
    }

    // 쿠폰 적용 버튼 이벤트
    if (applyCouponBtn) {
        const newApplyBtn = applyCouponBtn.cloneNode(true);
        applyCouponBtn.parentNode.replaceChild(newApplyBtn, applyCouponBtn);
        applyCouponBtn = newApplyBtn;

        applyCouponBtn.addEventListener("click", () => {
            const code = couponInput.value.trim();
            if (!code) {
                alert("쿠폰 코드를 입력해주세요.");
                return;
            }

            // 이미 적용된 쿠폰인지 확인
            if (appliedCoupons.some(c => c.code === code)) {
                alert("이미 적용된 쿠폰입니다.");
                couponInput.value = "";
                return;
            }

            const coupon = COUPONS.find(c => c.code === code);
            
            if (coupon) {
                appliedCoupons.push(coupon);
                renderAppliedCoupons();
                calculateTotal();
                couponInput.value = ""; 
            } else {
                alert("유효하지 않은 쿠폰입니다.");
            }
        });
    }

    // 결제 완료 버튼 이벤트
    if (confirmPaymentBtn) {
        const newConfirmBtn = confirmPaymentBtn.cloneNode(true);
        confirmPaymentBtn.parentNode.replaceChild(newConfirmBtn, confirmPaymentBtn);
        confirmPaymentBtn = newConfirmBtn;

        newConfirmBtn.addEventListener("click", () => {
            if (!loggedInUser) return;
            
            const monthsToAdd = parseInt(monthSelect.value);
            
            // 현재 만료일과 오늘 날짜 비교
            let currentExpireDate = new Date(loggedInUser.membershipExpireDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            currentExpireDate.setHours(0, 0, 0, 0);

            // 만료되었으면 오늘부터 시작, 아니면 기존 만료일부터 연장
            let newBaseDate = currentExpireDate < today ? today : currentExpireDate;
            
            // 개월 수 더하기
            let newExpireDate = new Date(newBaseDate);
            newExpireDate.setMonth(newExpireDate.getMonth() + monthsToAdd);
            
            // YYYY-MM-DD 형식으로 변환
            const year = newExpireDate.getFullYear();
            const month = String(newExpireDate.getMonth() + 1).padStart(2, '0');
            const day = String(newExpireDate.getDate()).padStart(2, '0');
            const newExpireDateString = `${year}-${month}-${day}`;

            // 데이터 갱신
            loggedInUser.membershipExpireDate = newExpireDateString;
            localStorage.setItem('user', JSON.stringify(loggedInUser)); 
            
            // UI 갱신
            displayMemberInfo(loggedInUser);

            const total = totalPriceDisplay.textContent;
            alert(`${monthsToAdd}개월 회원권 (${total}) 결제가 완료되었습니다!\n회원권이 ${newExpireDateString}까지 연장되었습니다.`);
            showView("main");
        });
    }

    // 초기 화면 상태 결정: 항상 localStorage를 기준으로 상태 동기화
    const storedUser = localStorage.getItem('user');
    loggedInUser = storedUser ? JSON.parse(storedUser) : null;
    
    // console.log("Initial State - User:", loggedInUser); // Debug log

    if (loggedInUser) {
        // 로그인 상태
        displayMemberInfo(loggedInUser);
        
        if (sessionStorage.getItem('pendingPayment') === 'true') {
            checkPendingPayment();
        } else {
            showView('main');
        }
    } else {
        // 비로그인 상태
        showView('login');
    }
};
// End of initMyPage (Do not call it automatically here, let the router handle it)