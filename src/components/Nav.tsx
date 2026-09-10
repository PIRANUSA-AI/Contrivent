import { useEffect, useState, type MouseEvent } from 'react';
import { navCta, navLinks } from '../content';
import { scrollToTarget } from '../lib/scroll';

export default function Nav() {
  const [active, setActive] = useState<string>('home');
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY && y > 480);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (event: MouseEvent, selector: string) => {
    event.preventDefault();
    setOpen(false);
    scrollToTarget(selector);
  };

  const classes = ['nav', scrolled && 'is-scrolled', hidden && !open && 'is-hidden', open && 'is-open'].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <a href="#home" className="nav__logo" onClick={(e) => go(e, '#home')}>
        Contrivent
      </a>

      <nav className="nav__links" aria-label="Primary">
        {navLinks.map(({ id, label }) => (
          <a key={id} href={`#${id}`} className={`nav__link ${active === id ? 'is-active' : ''}`} onClick={(e) => go(e, `#${id}`)}>
            {label}
          </a>
        ))}
      </nav>

      <a href={navCta.href} className="btn btn--light nav__cta" onClick={(e) => go(e, navCta.href)}>
        {navCta.label}
      </a>

      <button className="nav__toggle" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        <span />
        <span />
      </button>
    </header>
  );
}
