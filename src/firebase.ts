import { collection, addDoc, setDoc, doc, serverTimestamp, onSnapshot, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseApp } from './firebaseConfig';
import { DieselConsumptionRecord } from './types/diesel';
import { Trip } from './types';
import { firestore, handleFirestoreError } from './utils/firebaseConnectionHandler';

// Use the storage service
const storage = getStorage(firebaseApp);

// Add audit log function
export const addAuditLogToFirebase = async (auditLogData: any) => {
  try {
    const auditLogsRef = collection(firestore, 'auditLogs');
    const docRef = await addDoc(auditLogsRef, {
      ...auditLogData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    console.log('Audit log added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding audit log:', error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Add diesel record to Firebase
export const addDieselToFirebase = async (dieselRecord: DieselConsumptionRecord) => {
  try {
    const dieselRef = doc(firestore, 'diesel', dieselRecord.id);
    await setDoc(dieselRef, {
      ...dieselRecord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Diesel record added with ID:', dieselRecord.id);
    return dieselRecord.id;
  } catch (error) {
    console.error('Error adding diesel record:', error);
    throw error;
  }
};

// Add trip to Firebase
export const addTripToFirebase = async (trip: Trip) => {
  try {
    const tripRef = doc(firestore, 'trips', trip.id);
    await setDoc(tripRef, {
      ...trip,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Trip added with ID:', trip.id);
    return trip.id;
  } catch (error) {
    console.error('Error adding trip:', error);
    throw error;
  }
};

// Add missed load to Firebase
export const addMissedLoadToFirebase = async (missedLoadData: any) => {
  try {
    const missedLoadsRef = collection(firestore, 'missedLoads');
    const docRef = await addDoc(missedLoadsRef, {
      ...missedLoadData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Missed load added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding missed load:', error);
    throw error;
  }
};

// Function to update a trip in Firebase
export async function updateTripInFirebase(tripId: string, tripData: Partial<Trip>) {
  const tripRef = doc(firestore, 'trips', tripId);
  await setDoc(tripRef, { ...tripData, updatedAt: serverTimestamp() }, { merge: true });
}
// Function to update a diesel record in Firebase
export async function updateDieselInFirebase(dieselId: string, dieselData: Partial<DieselConsumptionRecord>) {
  try {
    const dieselRef = doc(firestore, 'diesel', dieselId);
    await setDoc(dieselRef, { 
      ...dieselData, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
    console.log('Diesel record updated with ID:', dieselId);
    return dieselId;
  } catch (error) {
    console.error('Error updating diesel record:', error);
    throw error;
  }
}

// Function to delete a trip from Firebase
export async function deleteTripFromFirebase(tripId: string) {
  try {
    const tripRef = doc(firestore, 'trips', tripId);
    await deleteDoc(tripRef);
    console.log('Trip deleted with ID:', tripId);
    return tripId;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}

// Function to delete a diesel record from Firebase
export async function deleteDieselFromFirebase(dieselId: string) {
  try {
    const dieselRef = doc(firestore, 'diesel', dieselId);
    await deleteDoc(dieselRef);
    console.log('Diesel record deleted with ID:', dieselId);
    return dieselId;
  } catch (error) {
    console.error('Error deleting diesel record:', error);
    throw error;
  }
}

// Function to delete a missed load from Firebase
export async function deleteMissedLoadFromFirebase(missedLoadId: string) {
  try {
    const missedLoadRef = doc(firestore, 'missedLoads', missedLoadId);
    await deleteDoc(missedLoadRef);
    console.log('Missed load deleted with ID:', missedLoadId);
    return missedLoadId;
  } catch (error) {
    console.error('Error deleting missed load:', error);
    throw error;
  }
}

// Function to update a missed load in Firebase
export async function updateMissedLoadInFirebase(missedLoadId: string, missedLoadData: any) {
  try {
    const missedLoadRef = doc(firestore, 'missedLoads', missedLoadId);
    await setDoc(missedLoadRef, { 
      ...missedLoadData, 
      updatedAt: serverTimestamp() 
    }, { merge: true });
    console.log('Missed load updated with ID:', missedLoadId);
    return missedLoadId;
  } catch (error) {
    console.error('Error updating missed load:', error);
    throw error;
  }
}
// Firestore listener for real-time updates
export function listenToDriverBehaviorEvents(callback: (events: any[]) => void) {
  const eventsRef = collection(firestore, "driverBehaviorEvents");
  const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(events);
  });
  return unsubscribe;
}

// --- New TyreStores Helpers ---
import type { TyreStore, StockEntry } from './types/tyre';

/**
 * Add a new TyreStore document
 */
export async function addTyreStore(store: TyreStore): Promise<void> {
  const storeRef = doc(firestore, 'tyreStores', store.id);
  await setDoc(storeRef, {
    ...store,
    dateAdded: serverTimestamp()
  });
}

/**
 * Update or insert a stock entry in a specific TyreStore
 */
export async function updateTyreStoreEntry(storeId: string, entry: StockEntry): Promise<void> {
  const storeRef = doc(firestore, 'tyreStores', storeId);
  const snap = await getDoc(storeRef);
  if (!snap.exists()) throw new Error(`TyreStore ${storeId} does not exist`);
  const data = snap.data() as TyreStore;
  const entries = data.entries || [];
  const idx = entries.findIndex(e => e.tyreId === entry.tyreId);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  await updateDoc(storeRef, { entries });
}

/**
 * Listen to all TyreStore documents in real time
 */
export function listenToTyreStores(onChange: (stores: TyreStore[]) => void) {
  const collRef = collection(firestore, 'tyreStores');
  return onSnapshot(collRef, snapshot => {
    const stores: TyreStore[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<TyreStore, 'id'>) }));
    onChange(stores);
  });
}
// --- End TyreStores Helpers ---

export { firestore, storage };
export { firestore as db };
export default firebaseApp;