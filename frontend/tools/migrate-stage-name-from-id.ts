/**
 * Script to ensure opportunity.stage holds the stage NAME, with opportunity.stageId holding the ID.
 * - If stageId exists, set stage = pipelineStages[stageId].name
 * - If stageId missing but stage is present (id/name/slug), attempt to resolve and set both stageId and stage=name
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

  const idToName: Record<string, string> = {};
  const nameOrSlugToId: Record<string, string> = {};
  stages.forEach(s => {
    idToName[s.id] = s.name;
    if (s.name) {
      nameOrSlugToId[s.name.toLowerCase()] = s.id;
      nameOrSlugToId[slugify(s.name)] = s.id;
    }
  });

  const oppSnap = await getDocs(collection(db, 'opportunities'));
  let updated = 0;
  for (const d of oppSnap.docs) {
    const data: any = d.data();
    const updates: any = {};
    const hasStageId = typeof data.stageId === 'string' && data.stageId.length > 0;

    if (hasStageId) {
      const name = idToName[data.stageId];
      if (name && data.stage !== name) {
        updates.stage = name;
      }
    } else if (data.stage) {
      // Try to resolve existing stage value (id/name/slug) to an id and name
      const raw = String(data.stage).toLowerCase();
      const resolvedId = idToName[raw] ? raw : nameOrSlugToId[raw];
      if (resolvedId) {
        updates.stageId = resolvedId;
        updates.stage = idToName[resolvedId] || data.stage;
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'opportunities', d.id), updates);
      updated++;
      console.log(`Updated ${d.id}:`, updates);
    }
  }
  console.log(`Done. Updated ${updated} opportunities.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
