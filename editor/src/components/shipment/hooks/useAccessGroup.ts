import { doc, Firestore, onSnapshot, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFrontbacked } from "use-frontbacked";

interface AccessGroup {
    admins: string[],
    members: string[],
    authorId: string,
    balance: number,
    created_at: Timestamp,
    doc_path: string,
    id: string,
    clientId: string,
    adminKey: string
}

const useAccessGroup = (docId?: string | null) => {
  const { db, user, auth, authLoading } = useFrontbacked();
  const [loadingAccessGroup, setLoadingAccessGroup] = useState<boolean>(false);
  const [accessGroupData, setAccessGroupData] = useState<AccessGroup | null>(null);

  useEffect(() => {
    if (!(db instanceof Firestore) || !docId) return;

    if (!user) {
      if (!authLoading && (window as any).unsubscribeAccessGroupRef) {
        (window as any).unsubscribeAccessGroupRef();
      }
      return;
    }

    setLoadingAccessGroup(true);

    const accessGroupRef = doc(db, `access_groups/${docId}`);

    const unsubscribe = onSnapshot(
      accessGroupRef,
      (snapshot) => {
        if (snapshot.exists()) {
            const admins = snapshot.data().admins
            const members = snapshot.data().members
            console.log("useAccessGroup:", admins, members, snapshot.data())
            setAccessGroupData({ 
                id: snapshot.id, ...snapshot.data(),
                adminKey: admins && admins.length > 0? admins[0] : undefined,
                clientId: members && members.length > 1? members[1] : undefined
            } as AccessGroup);
        } else {
          setAccessGroupData(null);
        }
        setLoadingAccessGroup(false);
      },
      (error) => {
        console.error("Failed to subscribe to access group:", error);
        setLoadingAccessGroup(false);
      }
    );

    // Store unsubscribe globally (if needed for manual cleanup)
    (window as any).unsubscribeAccessGroupRef = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [db, user, authLoading, docId]);

  return {
    accessGroupData,
    loadingAccessGroup,
  };
};

export default useAccessGroup;