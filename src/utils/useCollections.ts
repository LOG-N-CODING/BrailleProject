// useCollection.ts
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useCollection<T>(colName: string) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    const q = query(collection(db, colName), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap =>
      setData(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as T) })))
    );
  }, [colName]);
  return data;
}
