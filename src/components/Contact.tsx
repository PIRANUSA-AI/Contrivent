import { useState, type FormEvent } from 'react';
import { contactEmail } from '../content';

/**
 * Opens a draft in the visitor's own mail app, so no backend is needed.
 * The same link is offered again in the confirmation, in case the OS has no
 * mail handler wired up.
 */
function buildMailto(email: string) {
  const subject = 'Project inquiry';
  const body = `Email: ${email}\n\nWhat I want to stop doing by hand:\n\n`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function Contact() {
  const [email, setEmail] = useState('');
  const [opened, setOpened] = useState(false);

  const draftLink = buildMailto(email);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = draftLink;
    setOpened(true);
  };

  return (
    <section id="contact" className="section contact">
      <p className="mono-label mono-label--center" data-reveal>
        <span className="dot" /> Contact
      </p>
      <h2 className="contact__title" data-reveal>
        Let's build <em>yours.</em>
      </h2>
      <p className="contact__lead" data-reveal>
        Tell us what you wish would just happen on its own. We'll scout it, forge it, and orchestrate it.
      </p>

      {opened ? (
        <p className="contact__sent" role="status">
          <span className="blink" />
          <span>
            Draft opened in your mail app. Not there?{' '}
            <a href={draftLink}>Open it again</a> or write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </span>
        </p>
      ) : (
        <form className="contact__form" onSubmit={submit} data-reveal>
          <label className="sr-only" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="btn btn--light">
            Start a project
          </button>
        </form>
      )}

      <a className="contact__mail" href={`mailto:${contactEmail}`}>
        or write to {contactEmail}
      </a>
    </section>
  );
}
