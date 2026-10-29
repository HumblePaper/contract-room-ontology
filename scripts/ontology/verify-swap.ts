/** After the swap file, the live node count must equal the node_count the swap wrote to ref_meta. Returns an error message, or null when they agree. */
export function swapMismatch(liveNodes: number | null, metaNodeCount: number | null): string | null {
  if (liveNodes !== null && metaNodeCount !== null && liveNodes === metaNodeCount) return null;
  return `SWAP VERIFICATION FAILED: ref_nodes has ${liveNodes ?? 'no readable count'} rows but ref_meta node_count is ${metaNodeCount ?? 'missing'}. The live tables may be partial; re-run the swap file (the last file in build/d1) now.`;
}

/** The numbers out of `wrangler d1 execute --json` output (an array of result sets). */
export function firstRows(json: string): Record<string, unknown>[] {
  const parsed = JSON.parse(json.slice(json.indexOf('[')));
  return parsed[0]?.results ?? [];
}
