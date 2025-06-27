import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../types';
import { auth } from '../firebase/config';
import { authService } from '../services/authService';
import { getUserProfile } from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Configurando listener de autenticación...');
    let timeoutId: NodeJS.Timeout;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Estado de autenticación cambió:', firebaseUser ? 'Usuario autenticado' : 'Usuario no autenticado');
      
      // Clear any existing timeout to prevent multiple rapid calls
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Debounce the user profile fetching to prevent rapid successive calls
      timeoutId = setTimeout(async () => {
        if (firebaseUser) {
          console.log('🔄 Usuario autenticado detectado:', firebaseUser.uid);
          console.log('🔍 Estado de autenticación:', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            isAnonymous: firebaseUser.isAnonymous,
            providerId: firebaseUser.providerId || 'No disponible'
          });
          
          try {
            const userProfile = await getUserProfile(firebaseUser.uid);
            if (userProfile) {
                console.log('✅ Perfil de usuario obtenido de Firestore:', userProfile);
                setCurrentUser(userProfile);
            } else {
                console.log('⚠️ No se encontró perfil en Firestore, creando usuario temporal');
                // This case might happen if Firestore doc creation fails after registration.
                // For now, we create a temporary user object from auth data.
                setCurrentUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email || '',
                });
            }
          } catch (error) {
            console.error('❌ Error al obtener perfil de usuario:', error);
            // Fallback to auth data
            setCurrentUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email || '',
            });
          }
        } else {
          console.log('🔄 Usuario no autenticado');
          // User is signed out
          setCurrentUser(null);
        }
        console.log('✅ Finalizando carga de autenticación');
        setIsLoading(false);
      }, 300); // 300ms debounce
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password);
    // onAuthStateChanged will handle setting the user state
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await authService.register(name, email, password);
    // onAuthStateChanged will handle setting the user state
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    await authService.deleteAccount(password);
    setCurrentUser(null);
  }, []);

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};