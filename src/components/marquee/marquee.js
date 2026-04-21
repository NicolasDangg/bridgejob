function initMarqueeHighlight(marqueeEl, options = {}) {
    if (!marqueeEl) {
        console.warn('initMarqueeHighlight: no element provided');
        return;
    }

    const zone = options.zone || 0.18;
    let rafId;

    function update() {
        const items = marqueeEl.querySelectorAll('.logo-item');
        const rect = marqueeEl.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const threshold = rect.width * zone;

        items.forEach(item => {
            const r = item.getBoundingClientRect();
            const mid = r.left + r.width / 2;
            item.classList.toggle(
                'is-center',
                Math.abs(mid - center) < threshold
            );
        });

        rafId = requestAnimationFrame(update);
    }

    update();

    // Return a cleanup function
    return function destroy() {
        cancelAnimationFrame(rafId);
    };
}

// Auto-init any marquee with data-marquee-highlight
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-marquee-highlight]')
        .forEach(el => {
            const zone = parseFloat(el.dataset.marqueeHighlight) || 0.18;
            initMarqueeHighlight(el, { zone });
        });
});