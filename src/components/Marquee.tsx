import { useEffect, useRef } from 'react';

const LOGOS = [
  { name: 'Google', icon: (
    <svg viewBox="0 0 24 24" fill="none" className="w-11 h-11"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  )},
  { name: 'Apple', icon: (
    <svg viewBox="0 0 24 24" fill="#1a1a1a" className="w-11 h-11"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
  )},
  { name: 'Stripe', icon: (
    <svg viewBox="0 0 24 24" fill="#635BFF" className="w-11 h-11"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.076c0 4.072 2.486 5.851 6.387 7.283 2.549 1.003 3.392 1.696 3.392 2.723 0 .966-.81 1.557-2.328 1.557-1.845 0-4.812-.923-6.738-2.155l-.93 5.59C5.348 23.17 8.28 24 11.14 24c2.617 0 4.757-.654 6.246-1.887 1.618-1.334 2.428-3.186 2.428-5.54 0-4.159-2.535-5.876-5.838-7.423z"/></svg>
  )},
  { name: 'Figma', icon: (
    <svg viewBox="0 0 24 24" fill="none" className="w-11 h-11"><path d="M8 24c2.21 0 4-1.79 4-4v-4H8c-2.21 0-4 1.79-4 4s1.79 4 4 4z" fill="#0ACF83"/><path d="M4 12c0-2.21 1.79-4 4-4h4v8H8c-2.21 0-4-1.79-4-4z" fill="#A259FF"/><path d="M4 4c0-2.21 1.79-4 4-4h4v8H8C5.79 8 4 6.21 4 4z" fill="#F24E1E"/><path d="M12 0h4c2.21 0 4 1.79 4 4s-1.79 4-4 4h-4V0z" fill="#FF7262"/><path d="M20 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z" fill="#1ABCFE"/></svg>
  )},
  { name: 'Notion', icon: (
    <svg viewBox="0 0 24 24" fill="#1a1a1a" className="w-11 h-11"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L18.41 2.33c-.42-.326-.98-.7-2.055-.607L3.62 2.793c-.466.046-.56.28-.373.466l1.212.95zm.793 2.89v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.84-.56.84-1.166V6.05c0-.607-.233-.933-.746-.886l-15.177.84c-.56.047-.747.327-.747.887zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.933-.234-1.494-.934l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V8.858L7.926 8.72c-.093-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.513.28-.886.747-.933l3.222-.186z"/></svg>
  )},
  { name: 'Slack', icon: (
    <svg viewBox="0 0 24 24" fill="none" className="w-11 h-11"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/><path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/><path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/><path d="M15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" fill="#ECB22E"/></svg>
  )},
  { name: 'Spotify', icon: (
    <svg viewBox="0 0 24 24" fill="#1DB954" className="w-11 h-11"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
  )},
];

export const Marquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    const marqueeEl = marqueeRef.current;
    if (!marqueeEl) return;

    const update = () => {
      const items = marqueeEl.querySelectorAll('.logo-item');
      const rect = marqueeEl.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const threshold = rect.width * 0.18;

      items.forEach(item => {
        const r = item.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        if (Math.abs(mid - center) < threshold) {
          item.classList.add('is-center');
        } else {
          item.classList.remove('is-center');
        }
      });
      rafId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="marquee-container overflow-hidden py-9 border-y border-border-subtle bg-surface-off-white">
      <div className="marquee" ref={marqueeRef}>
        <div className="marquee__group">
          {LOGOS.concat(LOGOS).map((logo, idx) => (
            <div key={idx} className="logo-item px-6 grayscale opacity-30 transition-all duration-500 flex items-center justify-center">
              {logo.icon}
            </div>
          ))}
        </div>
        <div className="marquee__group" aria-hidden="true">
          {LOGOS.concat(LOGOS).map((logo, idx) => (
            <div key={`dup-${idx}`} className="logo-item px-6 grayscale opacity-30 transition-all duration-500 flex items-center justify-center">
              {logo.icon}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee {
          --marquee-gap: 52px;
          --marquee-speed: 40s;
          display: flex;
          gap: var(--marquee-gap);
        }
        .marquee__group {
          display: flex;
          gap: var(--marquee-gap);
          flex-shrink: 0;
          align-items: center;
          animation: marquee-scroll var(--marquee-speed) linear infinite;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--marquee-gap))); }
        }
        .logo-item.is-center {
          filter: grayscale(0) opacity(1);
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};
