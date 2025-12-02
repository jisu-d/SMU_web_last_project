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
        script: 'mypage/script.js',
        init: 'initMyPage'
    },
    '/notice': {
        template: 'notice/index.html',
        style: 'notice/style.css',
        script: 'notice/script.js',
        init: 'initNotice'
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
            // HTML 로드
            const response = await fetch(route.template);
            if (!response.ok) throw new Error(`Failed to load ${route.template}`);
            const html = await response.text();
            
            this.appContent.innerHTML = html;

            // 메뉴 활성화 상태 업데이트
            this.updateActiveLink(path);

            // CSS 로드
            this.loadStyle(route.style);

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

    loadStyle(href) {
        // 기존 페이지 스타일 제거
        if (this.currentStyle) {
            this.currentStyle.remove();
            this.currentStyle = null;
        }
        if (!href) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        this.currentStyle = link;
    }

    loadScript(src, initFunctionName) {
        return new Promise((resolve, reject) => {
            if (!src) return resolve();

            // 이미 로드된 스크립트인지 확인
            const existingScript = document.querySelector(`script[src="${src}"]`);
            
            if (existingScript) {
                // 이미 있으면 초기화 함수만 다시 호출
                if (typeof window[initFunctionName] === 'function') {
                    window[initFunctionName]();
                }
                resolve();
                return;
            }

            // 새 스크립트 로드
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                if (typeof window[initFunctionName] === 'function') {
                    window[initFunctionName]();
                }
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
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