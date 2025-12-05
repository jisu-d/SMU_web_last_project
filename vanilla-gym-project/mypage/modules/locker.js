/**
 * 사물함 관리 모듈 (Locker Manager)
 * 역할: 사물함 모달 제어, 그리드 렌더링, 정보 저장
 */
(function() {
    const LockerManager = {
        /**
         * 모달 열기 및 초기화
         * @param {Object} user - 현재 로그인한 사용자 객체
         * @param {Array} allMembers - 전체 회원 목록 (사용 중인 사물함 확인용)
         */
        openModal: function(user, allMembers) {
            const lockerModal = document.getElementById("locker-modal");
            const modalLockerGrid = document.getElementById("modal-locker-grid");
            const modalLockerPw = document.getElementById("modal-locker-pw");
            const selectedLockerInput = document.getElementById("modal-locker-select");
        
            if (!lockerModal || !user) return;
        
            // 1. 사용 중인 사물함 식별 (본인 제외)
            const occupiedLockers = allMembers
                .filter(m => m.lockerNumber && m.id !== user.id)
                .map(m => m.lockerNumber);
        
            // 1. 사물함 데이터 리스트 생성 (50개)
            const lockerList = [];
            for (let i = 1; i <= 50; i++) {
                const isOccupied = occupiedLockers.includes(i);
                const isMine = user.lockerNumber === i;
                lockerList.push({
                    number: i,
                    isOccupied: isOccupied,
                    isMine: isMine,
                    status: isMine ? 'mine' : (isOccupied ? 'occupied' : 'available')
                });
            }
        
            // 2. 그리드 렌더링
            if (modalLockerGrid) {
                modalLockerGrid.innerHTML = ""; // 초기화
                
                lockerList.forEach(locker => {
                    const lockerBtn = document.createElement("div");
                    lockerBtn.className = "locker-item";
                    lockerBtn.textContent = locker.number;
                    lockerBtn.dataset.lockerNum = locker.number;
                    
                    // 상태에 따른 클래스 및 이벤트 처리
                    if (locker.status === 'occupied') {
                        lockerBtn.classList.add("disabled");
                        lockerBtn.title = "사용 중 (선택 불가)";
                        // disabled 상태이므로 이벤트 리스너 미등록
                    } else {
                        // 내 사물함이거나 빈 사물함인 경우 선택 가능
                        lockerBtn.addEventListener("click", () => this.selectLocker(locker.number));
                    }
        
                    if (locker.status === 'mine') {
                        lockerBtn.classList.add("selected");
                        if (selectedLockerInput) selectedLockerInput.value = locker.number;
                    }
        
                    modalLockerGrid.appendChild(lockerBtn);
                });
            }
        
            // 비밀번호 설정
            if (modalLockerPw) modalLockerPw.value = user.lockerPassword || "";
        
            lockerModal.style.display = "flex";
        },

        /**
         * 사물함 선택 처리
         * @param {number} lockerNum - 선택한 사물함 번호
         */
        selectLocker: function(lockerNum) {
            const modalLockerGrid = document.getElementById("modal-locker-grid");
            const selectedLockerInput = document.getElementById("modal-locker-select");
        
            // hidden input 값 업데이트
            if (selectedLockerInput) selectedLockerInput.value = lockerNum;
        
            // UI 클래스 업데이트 (하이라이트 이동)
            const buttons = modalLockerGrid.querySelectorAll(".locker-item");
            buttons.forEach(btn => {
                if (parseInt(btn.dataset.lockerNum) === lockerNum) {
                    btn.classList.add("selected");
                } else {
                    btn.classList.remove("selected");
                }
            });
        },

        /**
         * 모달 닫기
         */
        closeModal: function() {
            const lockerModal = document.getElementById("locker-modal");
            if (lockerModal) lockerModal.style.display = "none";
        },

        /**
         * 정보 저장
         * @param {Object} user - 현재 로그인한 사용자 객체
         * @param {Array} allMembers - 전체 회원 배열 (업데이트용)
         * @param {Function} onSuccessCallback - 저장 성공 시 실행할 콜백 (UI 갱신 등)
         */
        saveInfo: function(user, allMembers, onSuccessCallback) {
            const selectedLockerInput = document.getElementById("modal-locker-select");
            const modalLockerPw = document.getElementById("modal-locker-pw");
        
            if (!user || !selectedLockerInput || !modalLockerPw) return;
        
            const newLockerNum = parseInt(selectedLockerInput.value);
            const newLockerPw = modalLockerPw.value.trim();
        
            // 유효성 검사
            if (!newLockerNum) {
                alert("사물함 번호를 선택해주세요.");
                return;
            }
        
            if (!newLockerPw || newLockerPw.length !== 4 || isNaN(newLockerPw)) {
                alert("비밀번호는 4자리 숫자로 입력해주세요.");
                return;
            }
        
            // 데이터 업데이트
            // 1. 전체 회원 배열 업데이트
            const userIndex = allMembers.findIndex(m => m.id === user.id);
            if (userIndex !== -1) {
                allMembers[userIndex].lockerNumber = newLockerNum;
                allMembers[userIndex].lockerPassword = newLockerPw;
            }
            
            // 2. 현재 사용자 객체 업데이트
            user.lockerNumber = newLockerNum;
            user.lockerPassword = newLockerPw;
        
            // 3. 로컬 스토리지 저장
            localStorage.setItem('user', JSON.stringify(user));
        
            alert("사물함 정보가 수정되었습니다.");
            this.closeModal();

            // 후속 처리 (UI 갱신)
            if (onSuccessCallback) onSuccessCallback(user);
        }
    };

    // 전역 객체에 할당하여 외부에서 접근 가능하게 함
    window.LockerManager = LockerManager;
})();
