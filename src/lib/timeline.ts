/** One clip in a scroll story. `length` is how much scroll (in vh) the clip takes. */
export type Segment = { name: string; length: number; id?: string };

/** A segment placed on the story's 0-1 progress, plus its scroll offset in vh. */
export type Range = Segment & { start: number; end: number; offset: number };

export const totalLength = (segments: Segment[]) => segments.reduce((sum, segment) => sum + segment.length, 0);

export function segmentRanges(segments: Segment[]): Range[] {
  const total = totalLength(segments);
  let offset = 0;
  return segments.map((segment) => {
    const range = { ...segment, offset, start: offset / total, end: (offset + segment.length) / total };
    offset += segment.length;
    return range;
  });
}

/** Maps a 0-1 position inside a segment to the story's global progress. */
export const toGlobal = (range: Range) => (local: number) => range.start + local * (range.end - range.start);
