import { loadCorpus } from './ontology/corpus';
import { validate } from './ontology/validate';
import { styleDiagnostics } from './ontology/style';

const corpus = loadCorpus('ontology');
const diags = [...validate(corpus), ...styleDiagnostics(corpus)];
for (const d of diags) console.log(`${d.level === 'error' ? 'ERROR' : 'warn '} ${d.path}: ${d.message}`);
const errors = diags.filter((d) => d.level === 'error').length;
console.log(`${corpus.files.length} files, ${errors} errors, ${diags.length - errors} warnings`);
process.exit(errors ? 1 : 0);
