import { describe, it, expect } from 'vitest';
import { swapMismatch, firstRows } from '../../scripts/ontology/verify-swap';

describe('swapMismatch', () => {
  it('passes when the live count equals the recorded node_count', () => expect(swapMismatch(68, 68)).toBeNull());
  it('names both numbers and says to re-run the swap file on a mismatch', () => {
    const m = swapMismatch(0, 68);
    expect(m).toContain('0');
    expect(m).toContain('68');
    expect(m).toMatch(/re-run the swap file/);
  });
  it('fails when either number is unreadable', () => {
    expect(swapMismatch(null, 68)).not.toBeNull();
    expect(swapMismatch(68, null)).not.toBeNull();
  });
  it('reads rows out of wrangler json output', () => expect(firstRows('noise\n[{"results":[{"n":3}],"success":true}]')).toEqual([{ n: 3 }]));
});
