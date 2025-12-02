window.initAbout = function() {
    // About page specific logic
    if (window.lucide) lucide.createIcons();

    var KEYWORD = '상명대학교 천안캠퍼스 상명스포츠센터';
    var mapContainer = document.getElementById('kakao-map');

    if (!mapContainer) {
        console.error('Map container element with ID "map" not found.');
        return;
    }

    // 1. 장소 검색 객체를 생성합니다.
    // Kakao Maps API의 'services' 라이브러리가 로드되었는지 확인합니다.
    if (typeof kakao.maps.services === 'undefined' || typeof kakao.maps.services.Places === 'undefined') {
        mapContainer.innerHTML = 'Kakao 지도 서비스 라이브러리 로딩 실패.';
        console.error('Kakao Maps services library is not loaded.');
        return;
    }

    var ps = new kakao.maps.services.Places();

    // 2. 키워드로 장소를 검색합니다.
    ps.keywordSearch(KEYWORD, placesSearchCB);

    // 3. 장소검색이 완료되었을 때 호출되는 콜백함수
    function placesSearchCB (data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {

            // 첫 번째 검색 결과의 정보
            var firstPlace = data[0];
            var placePosition = new kakao.maps.LatLng(firstPlace.y, firstPlace.x);

            // 4. 지도 초기화 및 옵션 설정
            var mapOption = {
                center: placePosition,
                level: 4,
                draggable: false, // 지도 이동(드래그) 비활성화
                zoomable: false   // 확대/축소 비활성화
            };

            var map = new kakao.maps.Map(mapContainer, mapOption);

            // 5. 마커 생성 및 지도에 표시
            var marker = new kakao.maps.Marker({
                position: placePosition
            });
            marker.setMap(map);

            // 6. 인포윈도우에 표시할 내용
            var iwContent = [
                '<div style="padding:10px; min-width:250px; font-size:14px; line-height:1.5; word-break: keep-all;">',
                '   <h4 style="margin: 0 0 5px 0; font-weight: bold;">' + firstPlace.place_name + '</h4>',
                '   <p style="margin:0; color:#555;">' + (firstPlace.road_address_name || firstPlace.address_name) + '</p>',
                '   <div style="margin-top: 5px;">',
                '       <a href="https://map.kakao.com/link/to/' + firstPlace.place_name + ',' + firstPlace.y + ',' + firstPlace.x + '" target="_blank" style="color: #2563eb; text-decoration: underline;">길찾기</a>',
                '   </div>',
                '</div>'
            ].join('');

            var infowindow = new kakao.maps.InfoWindow({
                content : iwContent,
                removable : true
            });

            // 인포윈도우를 기본으로 열어둡니다.
            infowindow.open(map, marker);

        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            mapContainer.innerHTML = '검색 결과가 존재하지 않습니다.';
        } else {
            mapContainer.innerHTML = '장소 검색 중 오류가 발생했습니다. (상태: ' + status + ')';
        }
    }
};