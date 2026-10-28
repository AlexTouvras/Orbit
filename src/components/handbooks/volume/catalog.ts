/** Kinds the volume reader draws on purpose. Others fall back to a ruled list. */
export const VOLUME_FIGURE_KINDS = [
  "flow",
  "sheet",
  "reading",
  "uses",
  "matrix",
  "panels",
  "tree",
  "compare",
  "pyramid",
  "curve",
  "pipeline",
] as const;

export const VOLUME_PICTURE_SIZE: Record<string, { w: number; h: number }> = {
  "/handbook-art/data-that-drives-decisions/day.jpg": { w: 864, h: 1152 },
  "/handbook-art/data-that-drives-decisions/extracts.jpg": { w: 864, h: 1152 },
  "/handbook-art/data-that-drives-decisions/gate.jpg": { w: 1280, h: 720 },
  "/handbook-art/data-that-drives-decisions/keep.jpg": { w: 1152, h: 864 },
  "/handbook-art/data-that-drives-decisions/signals.jpg": { w: 864, h: 1152 },
  "/handbook-art/models-that-stay-in-the-decision/decision.jpg": { w: 1280, h: 720 },
  "/handbook-art/models-that-stay-in-the-decision/prepare.jpg": { w: 1280, h: 720 },
  "/handbook-art/models-that-stay-in-the-decision/features.jpg": { w: 1280, h: 720 },
  "/handbook-art/models-that-stay-in-the-decision/holdout.jpg": { w: 1280, h: 720 },
  "/handbook-art/models-that-stay-in-the-decision/watch.jpg": { w: 1280, h: 720 },
  "/handbook-art/models-that-stay-in-the-decision/card.jpg": { w: 1280, h: 720 },
};
