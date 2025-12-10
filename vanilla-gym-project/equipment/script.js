window.initEquipment = function() {
    const tabs = document.querySelectorAll('.equipment-tab');
    const contents = document.querySelectorAll('.equipment-item-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭과 콘텐츠 비활성화
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // 클릭된 탭 활성화
            tab.classList.add('active');

            // 타겟 콘텐츠 표시
            const targetId = tab.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // 전역 검색에서의 딥 링크 확인
    const targetEquipmentId = sessionStorage.getItem('targetEquipmentId');
    if (targetEquipmentId) {
        const targetTab = document.querySelector(`.equipment-tab[data-target="${targetEquipmentId}"]`);
        if (targetTab) {
            // 필요한 경우 렌더링 안정성을 보장하기 위한 약간의 지연 (여기서는 보통 안전함)
            setTimeout(() => targetTab.click(), 50);
        }
        sessionStorage.removeItem('targetEquipmentId');
    }
};