import Act from './Act';
import { orchestrateAct, orchestrateLog, orchestrateTally } from '../content';
import { toGlobal, type Range } from '../lib/timeline';

export default function Orchestrate({ range }: { range: Range }) {
  const g = toGlobal(range);

  return (
    <Act act={orchestrateAct} range={range}>
      <p className="instrument__head">
        <span>Live operations</span>
        <span className="agents" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.22}s` }} />
          ))}
        </span>
      </p>
      <div className="log">
        {orchestrateLog.map((line) => (
          <p key={line.time} className="log__line" data-from={g(line.from)} data-to={g(1)}>
            <span className="log__time">{line.time}</span>
            <span className="log__agent">{line.agent}</span>
            <span className="log__text">{line.text}</span>
          </p>
        ))}
      </div>
      <dl className="tally">
        {orchestrateTally.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              <span data-from={g(item.from)} data-to={g(item.to)} data-count={item.value}>
                0
              </span>
              {item.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </Act>
  );
}
