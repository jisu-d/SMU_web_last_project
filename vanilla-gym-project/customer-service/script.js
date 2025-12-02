window.initCustomerService = function() {
    // Accordion Logic
    const faqButtons = document.querySelectorAll('.cs-faq-question-btn');
    
    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.cs-faq-item');
            
            // Toggle active class on the clicked item
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                // Optional: Close other items
                // document.querySelectorAll('.cs-faq-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });

    // Category Filter Logic
    const categoryButtons = document.querySelectorAll('.cs-category-btn');
    const faqItems = document.querySelectorAll('.cs-faq-item');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            faqItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (category === '전체' || itemCategory === category) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
};
