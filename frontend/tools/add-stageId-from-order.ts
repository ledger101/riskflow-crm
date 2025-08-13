/**
 * Migration: For opportunities whose stage field stores the numeric order (as string / number),
 * set stageId to the pipeline stage document id that currently has that order.
 * Also replace legacy 'stage' with the canonical stageId for consistency.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Inline firebase config (env overrides if provided) to avoid module resolution issues.
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

async function run() {
  const app = initializeApp(firebaseConfig as any);
  const db = getFirestore(app);

  const stagesSnap = await getDocs(collection(db, 'pipelineStages'));
  const stages = stagesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  const orderMap: Record<string, string> = {}; // order -> stageId
  stages.forEach(s => {
    if (s.order !== undefined && s.order !== null) {
      orderMap[String(s.order)] = s.id;
    }
  });

  const oppSnap = await getDocs(collection(db, 'opportunities'));
  let updated = 0;
  for (const d of oppSnap.docs) {
    const data: any = d.data();
    if (data.stageId) continue; // already migrated
    const stageRaw = data.stage;
    if (stageRaw == null) continue;
    const mappedId = orderMap[String(stageRaw)];
    if (mappedId) {
      await updateDoc(doc(db, 'opportunities', d.id), { stageId: mappedId, stage: mappedId });
      updated++;
      console.log(`Updated ${d.id} -> stageId ${mappedId}`);
    }
  }
  console.log(`Migration complete. Updated ${updated} opportunities.`);
}

run().catch(e => { console.error(e); process.exit(1); });
