window.initHome = function() {
    // Lucide 아이콘 초기화
    if (window.lucide) {
        lucide.createIcons();
    }

    // 배너 로직
    const copyBtn = document.getElementById('btn-copy-code');
    const codeDisplay = document.getElementById('coupon-code');

    // 쿠폰 복사 기능
    copyBtn.addEventListener('click', () => {
        const code = codeDisplay.innerText;
        
        navigator.clipboard.writeText(code).then(() => {
            // 복사 성공 피드백
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check"></i> Copied!';
            copyBtn.style.backgroundColor = '#10B981'; // Emerald Green
            copyBtn.style.color = 'white';
            
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.backgroundColor = 'white';
                copyBtn.style.color = '#D4183D';
                if (window.lucide) lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error('복사 실패', err);
            alert('코드를 직접 복사해주세요: ' + code);
        });
    });
};