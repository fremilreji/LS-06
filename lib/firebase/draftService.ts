import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { AgreementDraft } from '@/types/agreement';

const COLLECTION_NAME = 'agreements';

export const FirestoreDraftService = {
  async saveDraft(draft: AgreementDraft, userId: string): Promise<boolean> {
    if (!db || !isFirebaseConfigured()) return false;

    try {
      const docRef = doc(db, COLLECTION_NAME, draft.id);
      await setDoc(
        docRef,
        {
          userId,
          title: draft.title,
          status: draft.status,
          version: draft.version,
          rawConversation: draft.extractedData.rawConversation,
          extractedData: draft.extractedData,
          clauses: draft.clauses,
          tamperEvidenceHash: draft.tamperEvidenceHash,
          auditTrail: draft.auditTrail,
          createdAt: draft.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      );

      // Save subcollection version snapshot
      const versionRef = doc(db, COLLECTION_NAME, draft.id, 'versions', `v${draft.version}`);
      await setDoc(versionRef, {
        version: draft.version,
        clauses: draft.clauses,
        tamperEvidenceHash: draft.tamperEvidenceHash,
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error('Error saving to Firestore:', err);
      return false;
    }
  },

  async getUserDrafts(userId: string): Promise<AgreementDraft[]> {
    if (!db || !isFirebaseConfigured() || !userId) return [];

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const drafts: AgreementDraft[] = [];

      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        drafts.push({
          id: docSnap.id,
          title: data.title,
          status: data.status,
          version: data.version || 1,
          createdAt: data.updatedAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          extractedData: data.extractedData,
          clauses: data.clauses || [],
          tamperEvidenceHash: data.tamperEvidenceHash || '',
          auditTrail: data.auditTrail || [],
          bothPartiesConfirmed: data.status === 'PARTY_CONFIRMED',
        });
      });

      return drafts;
    } catch (err) {
      console.error('Error fetching drafts from Firestore:', err);
      return [];
    }
  },

  async deleteDraft(draftId: string): Promise<boolean> {
    if (!db || !isFirebaseConfigured()) return false;

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, draftId));
      return true;
    } catch (err) {
      console.error('Error deleting from Firestore:', err);
      return false;
    }
  },
};
