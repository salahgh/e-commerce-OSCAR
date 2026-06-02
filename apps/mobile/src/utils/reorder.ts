export interface ReorderOutcome {
  added: number;
  failed: number;
}

export type ReorderStatus = 'success' | 'partial' | 'failed';

/** Classify the result of re-adding an order's lines to the cart. */
export function summarizeReorder({ added, failed }: ReorderOutcome): ReorderStatus {
  if (added === 0) return 'failed';
  if (failed > 0) return 'partial';
  return 'success';
}
