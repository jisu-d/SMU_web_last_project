// common/js/router.js

// 경로 앞에 '/'를 제거하여 상대 경로로 설정합니다.
const routes = {
    '/': {
        template: 'home/index.html',
        style: 'home/style.css',
        script: 'home/script.js',
        init: 'initHome'
    },
    '/about': {
        template: 'about/index.html',
        style: 'about/style.css',
        script: 'about/script.js',
        init: 'initAbout'
    },
    '/customer-service': {
        template: 'customer-service/index.html',
        style: 'customer-service/style.css',
        script: 'customer-service/script.js',
        init: 'initCustomerService'
    },
    '/equipment': {
        template: 'equipment/index.html',
        style: 'equipment/style.css',
        script: 'equipment/script.js',
        init: 'initEquipment'
    },
    '/mypage': {
        template: 'mypage/index.html',
        style: 'mypage/style.css',
        script: ['mypage/modules/locker.js', 'mypage/script.js'],
        init: 'initMyPage'
    },
    '/notice': {
        template: 'notice/index.html',
        style: 'notice/style.css',
        script: 'notice/script.js',
        init: 'initNotice'
    },
    '/reservation': {
        template: 'reservation/index.html',
        style: 'reservation/style.css',
        script: 'reservation/script.js',
        init: 'initReservation'
    }
};

class Router {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.currentStyle = null;
        
        // Hash 변경 감지 (예: #/about -> #/mypage)
        window.addEventListener('hashchange', () => {
            this.handleLocation();
        });

        // 초기 로드
        this.handleLocation();
    }

    // 현재 Hash에 맞는 페이지 로드
    async handleLocation() {
        // Hash가 없으면 '/'로 간주 (홈)
        let path = window.location.hash.slice(1) || '/';
        
        const route = routes[path] || routes['/'];

        try {
            // 1. HTML과 CSS를 병렬로 로드 시작
            const htmlPromise = fetch(route.template).then(response => {
                if (!response.ok) throw new Error(`Failed to load ${route.template}`);
                return response.text();
            });

            const stylePromise = this.preloadStyle(route.style);

            // 2. 두 리소스가 모두 준비될 때까지 대기
            const [html, newStyleLink] = await Promise.all([htmlPromise, stylePromise]);

            // 3. 로딩 도중 페이지가 바뀌었는지 확인 (Race Condition 방지)
            const currentPath = window.location.hash.slice(1) || '/';
            if (currentPath !== path) {
                if (newStyleLink) newStyleLink.remove(); // 불필요해진 스타일 제거
                return;
            }

            // 4. 기존 스타일 제거 및 새 스타일 적용
            if (this.currentStyle && this.currentStyle !== newStyleLink) {
                this.currentStyle.remove();
            }
            this.currentStyle = newStyleLink;
            
            // 5. HTML 주입 (이제 스타일이 준비되었으므로 FOUC 방지됨)
            this.appContent.innerHTML = html;

            // 메뉴 활성화 상태 업데이트
            this.updateActiveLink(path);

            // JS 로드 및 실행
            await this.loadScript(route.script, route.init);

            // 아이콘 초기화
            if (window.lucide) {
                lucide.createIcons();
            }

            // 스크롤 최상단으로 이동
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Router Error:', error);
            this.appContent.innerHTML = '<h1>Page Not Found</h1><p>페이지를 찾을 수 없습니다.</p>';
        }
    }

    updateActiveLink(path) {
        const navLinks = document.querySelectorAll('.header-nav-link');
        navLinks.forEach(link => {
            // href="#/about" 형태에서 #을 뺀 값과 path 비교
            const linkHash = link.getAttribute('href').substring(1); 
            if (linkHash === path || (path === '/' && linkHash === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 스타일을 미리 로드하고 Promise 반환
    preloadStyle(href) {
        return new Promise((resolve) => {
            if (!href) {
                resolve(null);
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            // 로드 완료 또는 에러 시 resolve (에러가 나도 페이지는 보여줘야 함)
            link.onload = () => resolve(link);
            link.onerror = () => {
                console.error(`Failed to load style: ${href}`);
                resolve(null);
            };

            document.head.appendChild(link);
        });
    }

    // 호환성을 위해 남겨두지만 내부적으로는 preloadStyle 사용 권장
    loadStyle(href) {
        this.preloadStyle(href).then(link => {
             if (this.currentStyle) {
                this.currentStyle.remove();
            }
            this.currentStyle = link;
        });
    }

    async loadScript(src, initFunctionName) {
        if (!src) return;

        const scriptsToLoad = Array.isArray(src) ? src : [src];

        // Wait for ALL scripts to finish loading
        const loadPromises = scriptsToLoad.map(scriptSrc => {
            return new Promise((resolve, reject) => {
                const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
                
                if (existingScript) {
                    resolve(); // Already loaded
                    return;
                }

                const script = document.createElement('script');
                script.src = scriptSrc;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        });

        await Promise.all(loadPromises);

        // Only AFTER all scripts are loaded, call the initialization function
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName]();
        }
    }
    
    // HTML 내부에서 onclick으로 호출하는 함수들을 위해 전역 노출
    // 예: router.navigate('/about') - 필요한 경우 사용
    navigate(path) {
        window.location.hash = path;
    }
}

// Router 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
    
    // 전역 헬퍼 함수 (HTML onclick 등에서 사용)
    window.navigateTo = (path) => {
        window.location.hash = path;
    };
});