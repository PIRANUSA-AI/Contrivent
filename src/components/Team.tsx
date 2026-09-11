import { useEffect, useRef } from 'react';
import ScrollSequence from './ScrollSequence';
import Divider from './Divider';
import deskaLoop from '../assets/deska-loop.mp4';
import yoelLoop from '../assets/yoel-loop.mp4';
import { prefersReducedMotion } from '../lib/scroll';
import {
  teamCrossfade,
  teamKicker,
  teamLead,
  teamMembers,
  teamSegments,
  teamTitle,
  type Member,
} from '../content';

/** Loop files come from scripts/make-loop.mjs (clip played forward then reversed). Vite hashes them, so a re-render busts cache on its own. */
const loops: Record<string, string> = { deska: deskaLoop, yoel: yoelLoop };

/**
 * Meet the team, in two moves:
 *  1. A plain intro on the site background with the two member cards (each a forward + reverse loop).
 *  2. A divider, then a textless scroll sequence that scrubs transition-3 into the outro (both start
 *     mid-clip). The last frame holds frozen until the visitor scrolls back and replays it.
 */
export default function Team() {
  return (
    <>
      <section className="team-intro">
        <div className="team-intro__inner">
          <p className="mono-label mono-label--center">
            <span className="dot" /> {teamKicker}
          </p>
          <h2 className="team-intro__title">{teamTitle}</h2>
          <p className="team-intro__lead">{teamLead}</p>

          <div className="team-intro__cards">
            {teamMembers.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <ScrollSequence segments={teamSegments} crossfade={teamCrossfade} className="team-seq" />
    </>
  );
}

/** A member card with a forward-then-reverse video background that only runs while on screen. */
function MemberCard({ member }: { member: Member }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!prefersReducedMotion) video.play().catch(() => undefined);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !prefersReducedMotion) video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <article className="member corners">
      <div className="member__media">
        <video
          ref={videoRef}
          className="member__video"
          src={loops[member.focus]}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <span className="member__scrim" aria-hidden="true" />
      </div>
      <div className="member__body">
        <p className="member__role">
          <span className="blink" /> {member.role}
        </p>
        <h3 className="member__name">{member.name}</h3>
        <p className="member__bio">{member.bio}</p>
        <ul className="member__tags">
          {member.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
