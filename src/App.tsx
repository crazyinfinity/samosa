/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { logoutUser, decodeEmailToUsername, getStoredSession } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    // 1. First check if an institutional username session exists
    const stored = getStoredSession();
    if (stored) {
      setCurrentUser(stored);
      // Validate in background against Firestore to ensure account status is still active
      getDoc(doc(db, 'users', stored.uid)).then(snap => {
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          if (profile.accountStatus === 'disabled') {
            logoutUser();
            setCurrentUser(null);
            alert('Your samosa.com account has been disabled by the administrator.');
          } else {
            setCurrentUser(profile);
          }
        }
      }).catch(() => {
        // Continue with stored session if offline
      });
    }

    // 2. Persistent Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Check if admin
          const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
          const isAdmin = adminDoc.exists() || fbUser.email === 'tamil.infinitystudioz@gmail.com';

          // Fetch user profile from /users/{uid}
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            if (profile.accountStatus === 'disabled') {
              await logoutUser();
              alert('Your samosa.com account has been deactivated by the administrator.');
              setCurrentUser(null);
            } else {
              setCurrentUser(profile);
            }
          } else {
            // First time auth without profile document
            const derivedUsername = fbUser.email 
              ? decodeEmailToUsername(fbUser.email) 
              : 'inf/user';

            const defaultProfile: UserProfile = {
              uid: fbUser.uid,
              username: derivedUsername,
              email: fbUser.email || '',
              role: isAdmin || derivedUsername === 'inf/admin' ? 'admin' : 'student',
              gradeAccess: ['GRADE_10', 'GRADE_12'],
              accountStatus: 'active',
              createdAt: new Date().toISOString()
            };
            setCurrentUser(defaultProfile);
          }
        } catch (err) {
          console.error('Error restoring session:', err);
        }
      } else if (!stored) {
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#07080c] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center font-bold text-lg font-mono animate-pulse">
          s
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-purple-300">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></div>
          <span>Validating samosa.com Zero-Trust Session...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard adminProfile={currentUser} onLogout={handleLogout} />;
  }

  return <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />;
}
