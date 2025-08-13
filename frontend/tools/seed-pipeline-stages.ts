/*
 * One-time pipeline stage seeding script.
 * Usage: npx ts-node tools/seed-pipeline-stages.ts  (or via npm run seed:pipeline-stages)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment firebase config from Angular environments file (simple parse)
// Assumes environment.ts exports environment = { firebase: { ... } }
function loadFirebaseConfig(): any {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.resolve(__dirname, '../src/environments/environment.ts');
  const file = readFileSync(envPath, 'utf-8');
  const match = file.match(/firebase:\s*({[\s\S]*?})/);
  if (!match) throw new Error('Unable to locate firebase config in environment.ts');
  // Use eval in a sandboxed manner to parse object (since it's TS not pure JSON)
  // Replace trailing commas for safety.
  const objLiteral = match[1].replace(/,(\s*[}\]])/g, '$1');
  // eslint-disable-next-line no-new-func
  return Function('return ' + objLiteral)();
}

async function seed() {
  const firebaseConfig = loadFirebaseConfig();
  const app = initializeApp(firebaseConfig);
  getAuth(app); // initialize auth in case rules require it
  const db = getFirestore(app);

  const collRef = collection(db, 'pipelineStages');
  const existing = await getDocs(collRef);
  if (!existing.empty) {
    console.log('Pipeline stages already exist. Aborting seeding.');
    return;
  }

  const defaultStages = [
    { name: 'Tender', defaultProbability: 10, order: 0 },
    { name: 'Lead', defaultProbability: 10, order: 1 },
    { name: 'Contact', defaultProbability: 15, order: 2 },
    { name: 'Proposal', defaultProbability: 20, order: 3 },
    { name: 'Decision', defaultProbability: 25, order: 4 },
    { name: 'Awarded', defaultProbability: 40, order: 5 },
    { name: 'Client', defaultProbability: 50, order: 6 },
    { name: 'Implementation', defaultProbability: 70, order: 7 },
    { name: 'Acceptance Testing', defaultProbability: 90, order: 8 },
    { name: 'Go-Live', defaultProbability: 100, order: 9 }
  ];

  const batch = writeBatch(db);
  defaultStages.forEach(s => {
    const ref = doc(collRef);
    batch.set(ref, s);
  });
  await batch.commit();
  console.log(`Seeded ${defaultStages.length} pipeline stages.`);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
