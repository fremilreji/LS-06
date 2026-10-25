import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return (
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your-firebase-api-key' &&
    firebaseConfig.projectId !== 'your-project-id'
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error);
}

import fs from 'fs';
import path from 'path';
import os from 'os';

function getCachePath(): string {
  try {
    return path.join(process.cwd(), '.deals_cache.json');
  } catch {
    return path.join(os.tmpdir(), 'dealproof_deals_cache.json');
  }
}

function readLocalCache(): Record<string, any> {
  try {
    const file = getCachePath();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      return JSON.parse(content);
    }
  } catch {
    // fallback
  }
  return {};
}

function writeLocalCache(dealId: string, deal: any): void {
  try {
    const file = getCachePath();
    const all = readLocalCache();
    all[dealId] = deal;
    fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');
  } catch {
    // fallback
  }
}

export { app, auth, db };

// Global fallback in-memory store for local testing and offline execution
declare global {
  var __inMemoryDealsStore: Map<string, any> | undefined;
}

if (!globalThis.__inMemoryDealsStore) {
  globalThis.__inMemoryDealsStore = new Map<string, any>();
}
const localDealStore = globalThis.__inMemoryDealsStore;

/**
 * Save a deal to Firestore (or local in-memory fallback if Firestore credentials are not configured)
 * Returns the generated or existing deal_id.
 */
export async function saveDealToFirestore(dealData: any): Promise<string> {
  const dealId = dealData.id || dealData.deal_id || `LOT-${Date.now().toString().slice(-8)}`;
  const nowIso = new Date().toISOString();
  
  const formattedDeal = {
    ...dealData,
    id: dealId,
    deal_id: dealId,
    updatedAt: nowIso,
    createdAt: dealData.createdAt || nowIso,
  };

  // Always cache locally in memory and on disk
  localDealStore.set(dealId, formattedDeal);
  writeLocalCache(dealId, formattedDeal);

  // If Firebase is configured, persist to Cloud Firestore
  if (db && isFirebaseConfigured()) {
    try {
      const dealRef = doc(db, 'deals', dealId);
      await setDoc(dealRef, {
        ...formattedDeal,
        serverTimestamp: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore write notice (falling back to memory):', err);
    }
  }

  return dealId;
}

/**
 * Fetch a deal from Firestore (or local in-memory fallback) by deal_id
 */
export async function getDealFromFirestore(dealId: string): Promise<any | null> {
  if (!dealId) return null;

  // 1. Try Firestore if active
  if (db && isFirebaseConfigured()) {
    try {
      const dealRef = doc(db, 'deals', dealId);
      const snap = await getDoc(dealRef);
      if (snap.exists()) {
        const data = snap.data();
        localDealStore.set(dealId, data);
        writeLocalCache(dealId, data);
        return data;
      }
    } catch (err) {
      console.warn('Firestore read notice (checking local cache):', err);
    }
  }

  // 2. Check disk cache first for multi-process / multi-device live sync
  const fileDeals = readLocalCache();
  if (fileDeals[dealId]) {
    const diskDeal = fileDeals[dealId];
    const memDeal = localDealStore.get(dealId);
    // Prefer disk copy if it has signatures or is newer
    if (!memDeal || diskDeal.signatures?.buyer || diskDeal.signatures?.supplier || (diskDeal.updatedAt && (!memDeal.updatedAt || diskDeal.updatedAt >= memDeal.updatedAt))) {
      localDealStore.set(dealId, diskDeal);
      return diskDeal;
    }
  }

  // 2b. Check local memory cache
  if (localDealStore.has(dealId)) {
    return localDealStore.get(dealId);
  }

  // 3. Fallback for common preset IDs for demonstration
  if (dealId === 'preset_1' || dealId === 'demo_1' || dealId.toLowerCase().includes('kurti-demo')) {
    return {
      id: dealId,
      deal_id: dealId,
      title: 'Bommanahalli Kurti Lot Job-Work Agreement',
      contract_status: 'READY_FOR_SIGNATURE',
      supplier_name: 'Suresh - Lakshmi Garments (Tailor)',
      buyer_name: 'Raghav - Apex Fashion Brands (Boutique)',
      udyam_number: 'UDYAM-KR-03-0128945',
      payment_terms: {
        quantity_pcs: 1500,
        rate_per_piece: 58,
        total_value: 87000,
        total_value_formatted: '87,000',
        payment_deadline_days: 15,
        statutory_mandate: 'Section 15 MSMED Act, 2006'
      },
      clauses: {
        scope: { value: 'Stitching of 1,500 Rayon Kurtis per approved sample' },
        delivery_timeline: { value: 'Within 14 business days of fabric delivery' }
      },
      extractedData: {
        title: 'Bommanahalli Kurti Lot Job-Work Agreement',
        rawConversation: 'Suresh: Namaste sir, Lakshmi Garments. Ready to stitch 1500 rayon kurtis at Rs 58 per piece.\nRaghav: Okay done Suresh, send it in 14 days.',
        quantity: { value: '1,500 pieces', isExplicit: true },
        price: { value: '₹87,000 (@ ₹58/pc Total Consideration)', isExplicit: true },
        deliveryTimeline: { value: 'Within 14 business days of fabric delivery', isExplicit: true },
        scopeOrProducts: { value: 'Stitching of 1,500 Rayon Kurtis', isExplicit: true }
      }
    };
  }

  return null;
}

/**
 * Update signature and metadata attribution log in Firestore
 */
export async function updateDealSignatureInFirestore(
  dealId: string, 
  role: 'buyer' | 'supplier', 
  signatureRecord: {
    signature_data: string;
    signer_name?: string;
    signer_phone?: string;
    otp?: string;
    client_ip: string;
    user_agent: string;
    timestamp_ist: string;
  }
): Promise<boolean> {
  const existing = await getDealFromFirestore(dealId) || { id: dealId, deal_id: dealId };
  
  const updatedSignatures = {
    ...(existing.signatures || {}),
    [role]: signatureRecord,
  };

  const updatedDeal = {
    ...existing,
    signatures: updatedSignatures,
    bothPartiesSigned: !!(updatedSignatures.supplier && updatedSignatures.buyer),
    updatedAt: new Date().toISOString(),
  };

  localDealStore.set(dealId, updatedDeal);
  writeLocalCache(dealId, updatedDeal);

  if (db && isFirebaseConfigured()) {
    try {
      const dealRef = doc(db, 'deals', dealId);
      await setDoc(dealRef, {
        signatures: updatedSignatures,
        bothPartiesSigned: updatedDeal.bothPartiesSigned,
        updatedAt: updatedDeal.updatedAt,
      }, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore signature update error:', err);
      return false;
    }
  }

  return true;
}
