window.initMyPage = function() {
    const viewLogin = document.getElementById('view-login');
    const viewMain = document.getElementById('view-main');
    const viewPayment = document.getElementById('view-payment');
    
    // Only setup if elements exist (sanity check)
    if (!viewLogin) return;

    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const toPaymentBtns = document.querySelectorAll('.to-payment-btn');
    const cancelPaymentBtn = document.getElementById('cancel-payment-btn');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');

    // Check if user is already "logged in" (simple session persistence simulation)
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        viewLogin.classList.remove('active');
        viewMain.classList.add('active');
        updateExpirationDate();
    }

    // Login Logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userId = document.getElementById('userId').value;
            const userPw = document.getElementById('password').value;

            if (userId === 'user123' && userPw === '1234') {
                sessionStorage.setItem('isLoggedIn', 'true');
                viewLogin.classList.remove('active');
                viewMain.classList.add('active');
                updateExpirationDate();
                // Update Header
                if (window.updateHeaderState) window.updateHeaderState();
            } else {
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            }
        });
    }

    // Auto-fill Test Credentials
    const testAccountFillBtn = document.getElementById('test-account-fill-btn');
    if (testAccountFillBtn) {
        testAccountFillBtn.addEventListener('click', () => {
            document.getElementById('userId').value = 'user123';
            document.getElementById('password').value = '1234';
        });
    }

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            viewMain.classList.remove('active');
            viewLogin.classList.add('active');
            document.getElementById('userId').value = '';
            document.getElementById('password').value = '';
            // Update Header
            if (window.updateHeaderState) window.updateHeaderState();
        });
    }

    // Navigation to Payment
    toPaymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewMain.classList.remove('active');
            viewPayment.classList.add('active');
            calculateTotal(); // Init calculation
        });
    });

    // Cancel Payment
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', () => {
            viewPayment.classList.remove('active');
            viewMain.classList.add('active');
        });
    }

    // Payment Calculation Logic
    const monthSelect = document.getElementById('month-select');
    const couponInput = document.getElementById('coupon-input');
    
    const baseMonthDisplay = document.getElementById('base-month-display');
    const basePriceDisplay = document.getElementById('base-price-display');
    const discountRow = document.getElementById('discount-row');
    const discountCount = document.getElementById('discount-count');
    const discountAmount = document.getElementById('discount-amount');
    const couponRow = document.getElementById('coupon-row');
    const couponAmountDisplay = document.getElementById('coupon-amount');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const couponAppliedMsg = document.getElementById('coupon-applied-msg');

    function calculateTotal() {
        if (!monthSelect) return;
        const months = parseInt(monthSelect.value);
        let price = months * 10000;
        
        // Base Display
        baseMonthDisplay.textContent = months;
        basePriceDisplay.textContent = (months * 10000).toLocaleString() + '원';

        // Volume Discount
        if (months >= 3) {
            const discMonths = Math.floor(months / 3);
            price -= discMonths * 1000;
            
            discountRow.style.display = 'flex';
            discountCount.textContent = discMonths;
            discountAmount.textContent = '-' + (discMonths * 1000).toLocaleString() + '원';
        } else {
            discountRow.style.display = 'none';
        }

        // Coupon Discount
        const code = couponInput.value.trim().toLowerCase();
        if (code === 'x-mas') {
            price = Math.floor(price * 0.8);
            
            couponRow.style.display = 'flex';
            couponAmountDisplay.textContent = '20% 적용'; 
            couponAppliedMsg.style.display = 'flex';
        } else {
            couponRow.style.display = 'none';
            couponAppliedMsg.style.display = 'none';
        }

        totalPriceDisplay.textContent = price.toLocaleString() + '원';
    }

    if (monthSelect) monthSelect.addEventListener('change', calculateTotal);
    if (couponInput) couponInput.addEventListener('input', calculateTotal);

    // Confirm Payment
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', () => {
            const months = monthSelect.value;
            const price = totalPriceDisplay.textContent;
            const method = document.querySelector('input[name="payment"]:checked').value;
            const methodText = method === 'card' ? '신용카드' : '현금';

            alert(`결제가 완료되었습니다!\n\n기간: ${months}개월\n결제 금액: ${price}\n결제 방법: ${methodText}`);
            
            viewPayment.classList.remove('active');
            viewMain.classList.add('active');
        });
    }

    function updateExpirationDate() {
        const expireEl = document.getElementById('expire-date-display');
        if (expireEl) {
            const today = new Date();
            const expire = new Date(today.getTime() + (6 * 24 * 60 * 60 * 1000)); // 6 days later
            const dateString = expire.getFullYear() + '. ' + (expire.getMonth() + 1) + '. ' + expire.getDate() + '.';
            expireEl.textContent = dateString;
        }
    }
};
