import mascot from '../assets/mascot.webp';

const columns = [
  {
    title: 'The triangle',
    links: [
      { label: 'Scout', href: '#scout' },
      { label: 'Forge', href: '#forge' },
      { label: 'Orchestrate', href: '#orchestrate' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  // TODO: real social URLs.
  {
    title: 'Social',
    links: [
      { label: 'X', href: '#' },
      { label: 'LinkedIn', href: '#' },
      { label: 'Instagram', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <p className="footer__lead">
          Systems that <em>run without you.</em>
        </p>
        <div className="footer__cols">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="mono-label">{column.title}</p>
              {column.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="footer__word" aria-hidden="true">
        <img className="footer__mascot" src={mascot} alt="" width={510} height={920} loading="lazy" />
        Contrivent
      </p>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Contrivent</span>
        <span>contrivent.com</span>
      </div>
    </footer>
  );
}
