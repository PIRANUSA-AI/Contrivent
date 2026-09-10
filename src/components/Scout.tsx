import Act from './Act';
import { scoutAct, scoutReadouts, scoutSignals } from '../content';
import { toGlobal, type Range } from '../lib/timeline';

export default function Scout({ range }: { range: Range }) {
  const g = toGlobal(range);

  return (
    <Act act={scoutAct} range={range}>
      <p className="instrument__head">
        <span>Scan · sample engagement</span>
        <span className="blink" />
      </p>
      <dl className="readouts">
        {scoutReadouts.map((readout) => (
          <div key={readout.label}>
            <dt>{readout.label}</dt>
            <dd data-from={g(readout.from)} data-to={g(readout.to)} data-count={readout.value}>
              0
            </dd>
          </div>
        ))}
      </dl>
      <span className="scanbar">
        <span />
      </span>
      <ul className="signals">
        {scoutSignals.map((signal, i) => (
          <li key={signal.text} className="signal" data-from={g(signal.from)} data-to={g(1)}>
            <span className="signal__code">SIG-{String(i + 1).padStart(2, '0')}</span>
            {signal.text}
          </li>
        ))}
      </ul>
    </Act>
  );
}
