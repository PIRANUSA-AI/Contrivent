import dividerImage from '../assets/divider.webp';

type Variant = { crop: 'top' | 'bottom'; mirrored: boolean };

/** Every crop × mirror combination, shuffled once per page load. Dividers cycle through it, so neighbours never match. */
const variants: Variant[] = (() => {
  const all: Variant[] = [
    { crop: 'top', mirrored: false },
    { crop: 'top', mirrored: true },
    { crop: 'bottom', mirrored: false },
    { crop: 'bottom', mirrored: true },
  ];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
})();

/**
 * Takes no space in the layout: the mecha artwork (top or bottom half, maybe mirrored) straddles
 * the seam between two sections and casts a shadow up onto the section before it.
 */
export default function Divider({ index }: { index: number }) {
  const { crop, mirrored } = variants[index % variants.length];

  return (
    <div className={`divider divider--${crop}${mirrored ? ' divider--mirrored' : ''}`} aria-hidden="true">
      <div className="divider__band">
        <div className="divider__shadow" />
        <div className="divider__art">
          <div className="divider__image" style={{ backgroundImage: `url(${dividerImage})` }} />
        </div>
      </div>
    </div>
  );
}
