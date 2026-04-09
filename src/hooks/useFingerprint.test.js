import { getVisitorId } from './useFingerprint';

describe('useFingerprint / getVisitorId', () => {
  let originalLocalStorage;

  beforeEach(() => {
    // Reset module-level cache by re-importing
    vi.resetModules();
    localStorage.clear();
  });

  it('returns a string visitor ID', async () => {
    const { getVisitorId: gv } = await import('./useFingerprint');
    const id = gv();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('returns same ID on subsequent calls (cached)', async () => {
    const { getVisitorId: gv } = await import('./useFingerprint');
    const id1 = gv();
    const id2 = gv();
    expect(id1).toBe(id2);
  });

  it('returns cached ID from localStorage', async () => {
    localStorage.setItem('fmx_visitor_id', 'cached-abc');
    const { getVisitorId: gv } = await import('./useFingerprint');
    const id = gv();
    expect(id).toBe('cached-abc');
  });

  it('stores generated ID in localStorage', async () => {
    const { getVisitorId: gv } = await import('./useFingerprint');
    const id = gv();
    expect(localStorage.getItem('fmx_visitor_id')).toBe(id);
  });

  it('handles localStorage errors gracefully', async () => {
    const originalGetItem = Storage.prototype.getItem;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.getItem = () => {
      throw new Error('denied');
    };
    Storage.prototype.setItem = () => {
      throw new Error('denied');
    };

    const { getVisitorId: gv } = await import('./useFingerprint');
    expect(() => gv()).not.toThrow();
    const id = gv();
    expect(typeof id).toBe('string');

    Storage.prototype.getItem = originalGetItem;
    Storage.prototype.setItem = originalSetItem;
  });
});
