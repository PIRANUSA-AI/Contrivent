import Act from './Act';
import { forgeAct, forgeReadyAt, forgeSteps } from '../content';
import { toGlobal, type Range } from '../lib/timeline';

export default function Forge({ range }: { range: Range }) {
  const g = toGlobal(range);

  return (
    <Act act={forgeAct} range={range}>
      <p className="instrument__head">
        <span>System assembly</span>
        <span className="blink" />
      </p>
      <div className="steps">
        {forgeSteps.map((step) => (
          <div key={step.label} className="step" data-from={g(step.from)} data-to={g(step.to)}>
            <div className="step__row">
              <span>{step.label}</span>
              <span className="step__pct">
                <span data-from={g(step.from)} data-to={g(step.to)} data-count={100}>
                  0
                </span>
                %
              </span>
            </div>
            <span className="step__bar">
              <span />
            </span>
          </div>
        ))}
      </div>
      <p className="forge__status" data-from={g(forgeReadyAt)} data-to={g(1)}>
        <span className="blink" /> System ready to deploy
      </p>
    </Act>
  );
}
