function initAbout() {
    // --- Map Initialization (Existing) ---
    const container = document.getElementById('kakao-map');
    
    if (window.kakao && window.kakao.maps) {
        const options = {
            center: new kakao.maps.LatLng(36.833805, 127.179108),
            level: 3
        };
        const map = new kakao.maps.Map(container, options);
        map.setZoomable(false); // Disable zoom
        map.setDraggable(false); // Disable drag
        const markerPosition  = new kakao.maps.LatLng(36.833805, 127.179108); 
        const marker = new kakao.maps.Marker({
            position: markerPosition
        });
        marker.setMap(map);
    } else {
        console.error('Kakao Map script not loaded.');
    }

    // --- Scroll Reveal Animation (New) ---
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before bottom
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Remove active class when scrolling out of view to reverse animation
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));
}