import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'customer' | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            let currentRole = userDoc.data().role;
            // Auto-upgrade to admin if email matches
            if (currentUser.email === 'shivanshdubey013@gmail.com' && currentRole !== 'admin') {
              currentRole = 'admin';
              await setDoc(userDocRef, { role: 'admin' }, { merge: true });
            }
            setRole(currentRole);
          } else {
            // Create new user document
            const newRole = currentUser.email === 'shivanshdubey013@gmail.com' ? 'admin' : 'customer';
            await setDoc(userDocRef, {
              email: currentUser.email || '',
              name: currentUser.displayName || '',
              role: newRole,
              createdAt: serverTimestamp()
            });
            setRole(newRole);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole('customer'); // Fallback
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
