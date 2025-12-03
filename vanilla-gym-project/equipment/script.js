window.initEquipment = function() {
    const tabs = document.querySelectorAll('.equipment-tab');
    const contents = document.querySelectorAll('.equipment-item-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab
            tab.classList.add('active');

            // Show target content
            const targetId = tab.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Check for Deep Link from Global Search
    const targetEquipmentId = sessionStorage.getItem('targetEquipmentId');
    if (targetEquipmentId) {
        const targetTab = document.querySelector(`.equipment-tab[data-target="${targetEquipmentId}"]`);
        if (targetTab) {
            // Small delay to ensure rendering stability if needed, but usually safe here
            setTimeout(() => targetTab.click(), 50);
        }
        sessionStorage.removeItem('targetEquipmentId');
    }
};
