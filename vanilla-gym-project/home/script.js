window.initHome = function() {
    // Home page specific logic if any
    // Currently only handleEventClick is global
    window.handleEventClick = function() {
        alert("🎄 할인코드: X-mas\n\n이 코드를 결제 시 쿠폰란에 입력하시면 20% 할인 혜택을 받으실 수 있습니다!");
    };

    const mapPopupBtn = document.getElementById('home-map-popup-btn');
    const mapModal = document.getElementById('map-modal');
    const closeMapModalBtn = document.getElementById('close-map-modal');
    const popupMapContainer = document.getElementById('home-popup-map');
    const mapKeyword = '충청남도 천안시 동남구 상명대길 31 상명스포츠센터';
    let mapInitialized = false;
    let kakaoMap = null; // Store map instance

    // Initialize icons for the newly added button
    if (window.lucide) {
        lucide.createIcons();
    }

    if (mapPopupBtn && mapModal && closeMapModalBtn) {
        mapPopupBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default anchor behavior if wrapped
            mapModal.style.display = 'flex';
            
            // Initialize map if not already done
            if (!mapInitialized) {
                // Small delay to ensure modal is rendered for correct map size calculation
                setTimeout(() => {
                    initKakaoMap(popupMapContainer, mapKeyword);
                    mapInitialized = true;
                }, 100);
            } else if (kakaoMap) {
                // If map exists, relayout to ensure it fits the container correctly
                setTimeout(() => {
                    kakaoMap.relayout();
                    // Optional: Re-center map
                    // kakaoMap.setCenter(savedCenter); 
                }, 100);
            }
        });

        closeMapModalBtn.addEventListener('click', () => {
            mapModal.style.display = 'none';
        });

        // Close modal when clicking outside content
        mapModal.addEventListener('click', (e) => {
            if (e.target === mapModal) {
                mapModal.style.display = 'none';
            }
        });
    }

    function initKakaoMap(container, keyword) {
        if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
            container.innerHTML = 'Kakao 지도 API 로딩 실패.';
            console.error('Kakao Maps API is not loaded.');
            return;
        }

        if (typeof kakao.maps.services === 'undefined' || typeof kakao.maps.services.Places === 'undefined') {
            container.innerHTML = 'Kakao 지도 서비스 라이브러리 로딩 실패.';
            console.error('Kakao Maps services library is not loaded.');
            return;
        }

        var ps = new kakao.maps.services.Places();

        ps.keywordSearch(keyword, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                var firstPlace = data[0];
                var placePosition = new kakao.maps.LatLng(firstPlace.y, firstPlace.x);

                var mapOption = {
                    center: placePosition,
                    level: 4,
                    draggable: false, // Make unmovable
                    zoomable: false   // Make unzoomable
                };

                kakaoMap = new kakao.maps.Map(container, mapOption); // Store instance

                var marker = new kakao.maps.Marker({
                    position: placePosition
                });
                marker.setMap(kakaoMap);

                var iwContent = [
                    '<div style="padding:5px; min-width:195px; font-size:12px; word-break: keep-all;">',
                    '   <div style="font-weight: bold; margin-bottom: 5px;">' + firstPlace.place_name + '</div>',
                    '   <a href="https://map.kakao.com/link/to/' + firstPlace.place_name + ',' + firstPlace.y + ',' + firstPlace.x + '" target="_blank" style="color: #2563eb; text-decoration: underline;">길찾기</a>',
                    '</div>'
                ].join('');
                var infowindow = new kakao.maps.InfoWindow({
                    content : iwContent
                });
                infowindow.open(kakaoMap, marker);

            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                container.innerHTML = '검색 결과가 존재하지 않습니다.';
            } else {
                container.innerHTML = '장소 검색 중 오류가 발생했습니다. (상태: ' + status + ')';
            }
        });
    }
};

