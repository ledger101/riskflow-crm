/**
 * Script to normalize opportunity.stage values to pipeline stage document IDs.
 * It matches existing stage field values that may be stored as name or slug
 * and updates them to the canonical stage id.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
// Inline config to avoid module resolution issues when running via ts-node with ESM.
const env = process.env as Record<string, string | undefined>;
const firebaseConfig = {
  apiKey: env['FB_API_KEY'] || 'AIzaSyDacE5eQwoYQ9zCThMvizeblK_zZfc-ShE',
  authDomain: env['FB_AUTH_DOMAIN'] || 'vendor-hc.firebaseapp.com',
  projectId: env['FB_PROJECT_ID'] || 'vendor-hc',
  storageBucket: env['FB_STORAGE_BUCKET'] || 'vendor-hc.firebasestorage.app',
  messagingSenderId: env['FB_MSG_SENDER_ID'] || '711170271683',
  appId: env['FB_APP_ID'] || '1:711170271683:web:e6b2890d4f65aebb58f576',
  measurementId: env['FB_MEASUREMENT_ID'] || 'G-TZM2MNNC8C'
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  const app = initializeApp(firebaseConfig as any);
  const db = getFirestore(app);

  const stagesSnap = await getDocs(collection(db, 'pipelineStages'));
  const stages = stagesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const stageLookup: Record<string, string> = {};
  stages.forEach(s => {
    stageLookup[s.id.toLowerCase()] = s.id;
    if (s.name) {
      stageLookup[s.name.toLowerCase()] = s.id;
      stageLookup[slugify(s.name)] = s.id;
    }
  });

  const oppSnap = await getDocs(collection(db, 'opportunities'));
  let updated = 0;
  for (const docSnap of oppSnap.docs) {
    const data: any = docSnap.data();
    const stageRaw = (data.stage || '').toLowerCase();
    const canonical = stageLookup[stageRaw];
    if (canonical && canonical !== data.stage) {
      await updateDoc(doc(db, 'opportunities', docSnap.id), { stage: canonical });
      updated++;
      console.log(`Updated opportunity ${docSnap.id} stage -> ${canonical}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} opportunities.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
