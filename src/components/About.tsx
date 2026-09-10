const principles = [
  { term: 'We are', detail: 'Builders, not consultants' },
  { term: 'We ship', detail: 'Systems, not slides' },
  { term: 'You get', detail: 'Things that keep running' },
];

export default function About() {
  return (
    <section id="about" className="section about">
      <p className="mono-label" data-reveal>
        <span className="dot" /> About
      </p>
      <div className="about__grid">
        <blockquote className="about__quote" data-reveal>
          We don't hand you a report and wish you luck. We hand you a system that <em>runs.</em>
        </blockquote>
        <div className="about__body" data-reveal>
          <p>
            Contrivent is a small team working the stretch where AI stops being a demo and starts doing real work. We go in,
            find what matters, build the machine around it, and stay until it runs on its own.
          </p>
          <p>
            Scout, Forge, Orchestrate isn't a menu. It's one continuous job, done by the same people, from the first signal
            to the system that's still working long after launch.
          </p>
          <dl className="about__facts">
            {principles.map(({ term, detail }) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
