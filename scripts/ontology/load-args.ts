/** The load target. It must be named: `--local` or `--remote`. Neither, or both, is null (the caller prints usage). */
export function parseLoadArgs(argv: string[]): 'local' | 'remote' | null {
  const local = argv.includes('--local');
  const remote = argv.includes('--remote');
  if (local === remote) return null;
  return local ? 'local' : 'remote';
}
