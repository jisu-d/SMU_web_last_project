window.initAbout = function() {
    // About page specific logic
    if (window.lucide) lucide.createIcons();

    // --- Trainer Data Definition ---
    var trainersData = {
        "1": {
            name: "엄희수 트레이너",
            specialty: "소프트웨어 전문",
            img: "img/1.png",
            certs: ["정보처리기사", "SQLD (SQL 개발자)", "리눅스마스터 2급"],
            edu: "상명대학교 컴퓨터과학과 학사",
            awards: ["2024 교내 해커톤 대상", "2023 오픈소스 컨트리뷰션 아카데미 우수 수료"],
            bio: "체계적인 데이터 분석을 통해 회원님의 운동 성과를 효율적으로 관리해 드립니다. 소프트웨어 공학적 접근으로 최적의 루틴을 설계해 드립니다."
        },
        "2": {
            name: "강건우 트레이너",
            specialty: "다이어트 전문",
            img: "img/2.png",
            certs: ["생활스포츠지도사 2급 (보디빌딩)", "NSCA-CPT (미국공인 퍼스널트레이너)", "스포츠영양코치"],
            edu: "한국체육대학교 사회체육학과 졸업",
            awards: ["2023 피트니스 스타 그랑프리", "2022 NABBA WFF 노비스 1위"],
            bio: "8년의 경력으로 수많은 다이어트 성공 사례를 만들었습니다. 단순히 굶는 다이어트가 아닌, 건강하고 지속 가능한 식단과 운동을 제안합니다."
        },
        "3": {
            name: "최영우 트레이너",
            specialty: "재활 운동 전문",
            img: "img/3.png",
            certs: ["물리치료사 면허", "KACEP (대한운동사협회) 개인운동사", "FMS (기능적 움직임 검사) Lv.2"],
            edu: "연세대학교 물리치료학과 석사",
            awards: ["2022 대한물리치료사협회 우수회원 표창", "재활 운동 관련 논문 3편 등재"],
            bio: "병원 임상 경력을 바탕으로 통증 없는 건강한 움직임을 찾아드립니다. 잘못된 자세 교정과 부상 방지에 특화된 트레이닝을 제공합니다."
        },
        "4": {
            name: "임지수 트레이너",
            specialty: "소프트웨어 전문",
            img: "img/4.png",
            certs: ["ADsP (데이터분석준전문가)", "빅데이터분석기사", "AWS Certified Cloud Practitioner"],
            edu: "상명대학교 휴먼지능정보공학 학사",
            awards: ["2024 캡스톤디자인 경진대회 최우수상", "2023 인공지능 모델링 대회 금상"],
            bio: "최신 피트니스 테크놀로지를 활용하여 과학적인 운동 프로그램을 제공합니다. 데이터 기반의 피드백으로 목표 달성 과정을 시각화해 드립니다."
        }
    };

    // --- Modal Logic ---
    var modal = document.getElementById('trainer-modal');
    var closeBtn = document.querySelector('.modal-close-btn');
    var trainerCards = document.querySelectorAll('.trainer-card');

    // Modal Elements to populate
    var mImg = document.getElementById('modal-img');
    var mName = document.getElementById('modal-name');
    var mSpecialty = document.getElementById('modal-specialty');
    var mCerts = document.getElementById('modal-certs');
    var mEdu = document.getElementById('modal-edu');
    var mAwards = document.getElementById('modal-awards');
    var mBio = document.getElementById('modal-bio');

    function openModal(id) {
        var data = trainersData[id];
        if (!data) return;

        // Populate data
        mImg.src = data.img;
        mImg.alt = data.name;
        mName.textContent = data.name;
        mSpecialty.textContent = data.specialty;
        mEdu.textContent = data.edu;
        mBio.textContent = data.bio;

        // Populate Lists (Clear previous first)
        mCerts.innerHTML = '';
        data.certs.forEach(function(cert) {
            var li = document.createElement('li');
            li.textContent = cert;
            mCerts.appendChild(li);
        });

        mAwards.innerHTML = '';
        data.awards.forEach(function(award) {
            var li = document.createElement('li');
            li.textContent = award;
            mAwards.appendChild(li);
        });

        // Show Modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Event Listeners
    trainerCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var id = this.getAttribute('data-id');
            openModal(id);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close when clicking outside the modal content
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });


    // --- Existing Map Logic (Preserved) ---
    var KEYWORD = '상명대학교 천안캠퍼스 상명스포츠센터';
    var mapContainer = document.getElementById('kakao-map');

    if (!mapContainer) {
        // Map might not be present if script is loaded elsewhere, but strictly checking for this page
        // console.error('Map container element with ID "kakao-map" not found.');
        return;
    }

    // 1. 장소 검색 객체를 생성합니다.
    // Kakao Maps API의 'services' 라이브러리가 로드되었는지 확인합니다.
    if (typeof kakao !== 'undefined' && kakao.maps && kakao.maps.services && kakao.maps.services.Places) {
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
    } else {
        // console.log('Kakao Maps services library is not loaded or not available.');
    }
};