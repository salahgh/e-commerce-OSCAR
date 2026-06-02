import { summarizeReorder } from '../reorder';

describe('summarizeReorder', () => {
  it('is "success" when everything was added', () => {
    expect(summarizeReorder({ added: 3, failed: 0 })).toBe('success');
  });

  it('is "partial" when some lines failed but at least one was added', () => {
    expect(summarizeReorder({ added: 2, failed: 1 })).toBe('partial');
  });

  it('is "failed" when nothing was added', () => {
    expect(summarizeReorder({ added: 0, failed: 2 })).toBe('failed');
  });
});
