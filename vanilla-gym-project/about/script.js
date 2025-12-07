function initAbout() {
    // --- Map Initialization (Updated: Keyword Search) ---
    const container = document.getElementById('kakao-map');
    
    if (window.kakao && window.kakao.maps) {
        const defaultCenter = new kakao.maps.LatLng(36.833805, 127.179108);
        const options = {
            center: defaultCenter,
            level: 3
        };
        const map = new kakao.maps.Map(container, options);
        map.setZoomable(false); 
        map.setDraggable(false);

        // Search for the location
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch('상명대학교 천안캠퍼스 상명스포츠센터', function(data, status, pagination) {
            if (status === kakao.maps.services.Status.OK) {
                const place = data[0];
                const coords = new kakao.maps.LatLng(place.y, place.x);
                
                // Move map center
                map.setCenter(coords);
                
                // Add marker
                const marker = new kakao.maps.Marker({
                    map: map,
                    position: coords
                });

                // Add InfoWindow with Directions Link
                const infowindow = new kakao.maps.InfoWindow({
                    content: `
                        <div style="padding:15px; min-width:240px; color:#333; font-family:sans-serif;">
                            <div style="font-weight:bold; margin-bottom:5px; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${place.place_name}</div>
                            <div style="font-size:12px; color:#666; margin-bottom:10px;">${place.road_address_name || place.address_name}</div>
                            <a href="https://map.kakao.com/link/to/${place.place_name},${place.y},${place.x}" target="_blank" style="display:block; width:100%; padding:8px 0; background:#FEE500; color:#191919; text-decoration:none; font-size:13px; border-radius:6px; font-weight:bold; text-align:center;">
                                카카오맵으로 길찾기
                            </a>
                        </div>
                    `
                });
                infowindow.open(map, marker);
            } else {
                // Fallback
                const marker = new kakao.maps.Marker({
                    position: defaultCenter
                });
                marker.setMap(map);
            }
        });
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