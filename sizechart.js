const urlApi = 'https://localhost:3443/public/sizechart/find-tag-and-type';

(function () {
    const raw = document.querySelector('#__INITIAL_STATE__')?.textContent;
    if (!raw) {
        console.error("❌ Không tìm thấy __INITIAL_STATE__");
        return;
    }
    const data = JSON.parse(raw);
    const productType = data?.product?.product?.product_type || '';
    const tags = data?.product?.product?.tags || '';
    const title = data?.product?.product?.title || '';
    const IFRAME_BASE = 'http://localhost:3000/public/sizecharts';
    const IFRAME_SRC = `${IFRAME_BASE}?${new URLSearchParams({
        tag: tags,
        productType
    }).toString()}`;
    const ROOT_SEL = 'section.block-container[block-id="qh5lC2"]';
    function resizeIframeBox(box) {
        const winWidth = window.innerWidth;
        let percent = 0.95;
        if (winWidth > 1200) percent = 0.7;
        else if (winWidth > 768) percent = 0.8;
        box.style.width = (percent * 100) + '%';
        box.style.height = (winWidth * percent * 9 / 16) + 'px';
    }

    function openDialog() {
        const overlay = document.createElement('div');
        overlay.id = 'dialog';
        overlay.style.cssText = `
        position:fixed; inset:0; width:100vw; height:100vh;
        background:#83878e; display:flex; justify-content:center; align-items:center;
        z-index:1000;
        `;

        const box = document.createElement('div');
        box.className = 'div-iframe';
        box.style.cssText = `
        width:60%; min-width:450px; aspect-ratio:16/9; margin-top:12px;
        border-radius:8px; overflow:hidden; position:relative; background:#000;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close-dialog';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = `✕`;
        closeBtn.style.cssText = `
        position:absolute;  right:12px; z-index:1; font-size:24px; font-weight:800;
        width:3rem; height:3rem; display:flex; align-items:center; justify-content:center;
        border:0; border-radius:12px;
        cursor:pointer; transition:transform .2s, filter .2s;
        `;
        closeBtn.addEventListener('mouseenter', () => { closeBtn.style.filter = 'brightness(1.06)'; closeBtn.style.transform = 'translateY(-1px)'; });
        closeBtn.addEventListener('mouseleave', () => { closeBtn.style.filter = ''; closeBtn.style.transform = ''; });
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.src = IFRAME_SRC;
        iframe.title = 'Size chart';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        box.appendChild(closeBtn);
        box.appendChild(iframe);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // events
        function close() {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('keydown', onKey);
            overlay.remove();
        }
        function onResize() { resizeIframeBox(box); }
        function onKey(e) { if (e.key === 'Escape') close(); }

        resizeIframeBox(box);
        window.addEventListener('resize', onResize);
        window.addEventListener('keydown', onKey);

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = 'red');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = '');
        closeBtn.addEventListener('click', close);
    }

    function attachBannerHandlers(el) {
        el.addEventListener('mouseover', () => { el.style.color = 'blue'; });
        el.addEventListener('mouseout', () => { el.style.color = ''; });
        el.addEventListener('click', openDialog);
    }

    function injectAboveRoot() {
        const root = document.querySelector(ROOT_SEL);
        if (!root) return;

        if (root.previousElementSibling && root.previousElementSibling.classList.contains('size-chart')) {
            attachBannerHandlers(root.previousElementSibling);
            return;
        }

        const el = document.createElement('div');
        el.className = 'size-chart';
        el.textContent = 'Size chart';
        el.style.cssText = 'cursor:pointer; text-decoration: underline; margin-bottom:8px'
        // Chèn LÊN TRÊN section gốc
        root.insertAdjacentElement('beforebegin', el);
        attachBannerHandlers(el);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAboveRoot);
    } else {
        injectAboveRoot();
    }

    // nếu là SPA: DOM thay đổi thì tự chèn lại (idempotent)
    const mo = new MutationObserver(injectAboveRoot);
    mo.observe(document.body, { childList: true, subtree: true });
})();
