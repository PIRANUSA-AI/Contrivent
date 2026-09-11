import dividerImage from '../assets/divider.webp';

/**
 * Takes no space in the layout: the mecha artwork straddles the seam between
 * two sections and casts a shadow up onto the section before it.
 * The artwork file is one seamless panel mirrored against itself, tiled
 * sideways - a repeating chevron of armour scales, identical on every divider.
 *
 * `shadow` drops the artwork and keeps only the gradient, for a seam that just
 * fades smoothly into the next section (used above the footer).
 */
export default function Divider({ shadow = false }: { shadow?: boolean }) {
  return (
    <div className="divider" aria-hidden="true">
      <div className="divider__band">
        <div className="divider__shadow" />
        {!shadow && (
          <div className="divider__art">
            <div className="divider__image" style={{ backgroundImage: `url(${dividerImage})` }} />
          </div>
        )}
      </div>
    </div>
  );
}
