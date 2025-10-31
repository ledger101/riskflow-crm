import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDacE5eQwoYQ9zCThMvizeblK_zZfc-ShE",
  authDomain: "vendor-hc.firebaseapp.com",
  projectId: "vendor-hc",
  storageBucket: "vendor-hc.firebasestorage.app",
  messagingSenderId: "711170271683",
  appId: "1:711170271683:web:e6b2890d4f65aebb58f576",
  measurementId: "G-TZM2MNNC8C"
};

interface Solution {
  id: string;
  name: string;
  cost?: number;
}

interface OpportunityDoc {
  id: string;
  solutionId?: string;
  solutionName?: string;
  solutions?: Array<{ id: string; name: string; cost?: number }>;
  solutionIds?: string[];
  value?: number;
  [key: string]: any;
}

async function authenticate() {
  const auth = getAuth();
  
  // You'll need to provide valid credentials here
  const email = process.env['FIREBASE_EMAIL'] || 'your-email@example.com';
  const password = process.env['FIREBASE_PASSWORD'] || 'your-password';
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Authenticated as:', userCredential.user.email);
    return true;
  } catch (error) {
    console.error('Authentication failed:', error);
    console.log('\nTo run this migration, you need to authenticate with Firebase.');
    console.log('Set environment variables:');
    console.log('  FIREBASE_EMAIL=your-email@example.com');
    console.log('  FIREBASE_PASSWORD=your-password');
    console.log('\nOr run the migration through the web application instead.');
    return false;
  }
}

async function run() {
  console.log('Starting opportunity solutions migration...');
  
  const app = initializeApp(firebaseConfig);
  
  // Authenticate first
  if (!(await authenticate())) {
    return;
  }
  
  const db = getFirestore(app);

  // Step 1: Load all solutions into a map for quick lookup
  console.log('Loading solutions...');
  const solutionsSnap = await getDocs(collection(db, 'solutions'));
  const solutionsMap = new Map<string, Solution>();
  
  solutionsSnap.docs.forEach(doc => {
    const data = doc.data();
    solutionsMap.set(doc.id, {
      id: doc.id,
      name: data['name'] || 'Unknown',
      cost: data['cost'] || 0
    });
  });
  
  console.log(`Loaded ${solutionsMap.size} solutions`);

  // Step 2: Process opportunities
  console.log('Loading opportunities...');
  const opportunitiesSnap = await getDocs(collection(db, 'opportunities'));
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const docSnap of opportunitiesSnap.docs) {
    const data: OpportunityDoc = { id: docSnap.id, ...docSnap.data() };
    
    try {
      // Skip if already has new format
      if (data.solutions && data.solutionIds) {
        skipped++;
        continue;
      }

      const updateData: any = {};
      let needsUpdate = false;

      // Migrate from legacy solutionId to new format
      if (data.solutionId && !data.solutions) {
        const solution = solutionsMap.get(data.solutionId);
        
        if (solution) {
          updateData.solutions = [{
            id: solution.id,
            name: solution.name,
            cost: solution.cost
          }];
          updateData.solutionIds = [solution.id];
          
          // Update value if not set or zero, using solution cost
          if (!data.value || data.value === 0) {
            updateData.value = solution.cost || 0;
          }
          
          needsUpdate = true;
        } else {
          console.warn(`Solution not found for ID: ${data.solutionId} in opportunity ${data.id}`);
          // Create a placeholder entry
          updateData.solutions = [{
            id: data.solutionId,
            name: data.solutionName || 'Unknown Solution',
            cost: 0
          }];
          updateData.solutionIds = [data.solutionId];
          needsUpdate = true;
        }
      }
      // Handle case where only solutionName exists (no ID)
      else if (data.solutionName && !data.solutionId && !data.solutions) {
        console.warn(`Only solutionName found for opportunity ${data.id}: ${data.solutionName}`);
        updateData.solutions = [{
          id: '',
          name: data.solutionName,
          cost: 0
        }];
        updateData.solutionIds = [];
        needsUpdate = true;
      }

      if (needsUpdate) {
        const docRef = doc(db, 'opportunities', data.id);
        await updateDoc(docRef, updateData);
        updated++;
        console.log(`Updated opportunity ${data.id}`);
      } else {
        skipped++;
      }

    } catch (error) {
      console.error(`Error processing opportunity ${data.id}:`, error);
      errors++;
    }
  }

  console.log('\nMigration complete!');
  console.log(`Total opportunities processed: ${opportunitiesSnap.docs.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already migrated): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

// Run the migration
run().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});