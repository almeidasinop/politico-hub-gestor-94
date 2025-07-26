import React, { useState, useEffect, useContext, createContext, useCallback, useMemo, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from "@/components/ui/use-toast";

// Define a forma do perfil do usuário para segurança de tipos
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  gabineteId?: string;
  ativo?: boolean;
}

// Define a forma do valor do contexto
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

// Cria o contexto com um tipo específico
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define as props para o provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as DocumentData;
          const profile: UserProfile = {
            uid: firebaseUser.uid,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            gabineteId: profileData.gabineteId,
            ativo: profileData.ativo,
          };

          // 1. Verificar se o próprio usuário está ativo
          if (profile.ativo === false) {
            setError("A sua conta de usuário está inativa. Contacte o administrador.");
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setIsLoading(false);
            return;
          }

          // 2. Se não for superadmin, verificar o gabinete
          if (profile.role !== 'superadmin') {
            if (!profile.gabineteId) {
              setError("Você não está vinculado a nenhum gabinete.");
              await signOut(auth);
              setUser(null);
              setUserProfile(null);
              setIsLoading(false);
              return;
            }

            const gabineteRef = doc(db, 'gabinetes', profile.gabineteId);
            const gabineteSnap = await getDoc(gabineteRef);

            if (!gabineteSnap.exists()) {
              setError("O gabinete associado à sua conta não foi encontrado.");
              await signOut(auth);
              setUser(null);
              setUserProfile(null);
              setIsLoading(false);
              return;
            }

            const gabineteData = gabineteSnap.data();
            const isGabineteAtivo = gabineteData.ativo === true;
            const isGabineteVencido = new Date() > gabineteData.vencimento.toDate();

            if (!isGabineteAtivo || isGabineteVencido) {
              const motivo = !isGabineteAtivo ? "inativo" : "vencido";
              setError(`O acesso foi negado porque o seu gabinete está ${motivo}.`);
              await signOut(auth);
              setUser(null);
              setUserProfile(null);
              setIsLoading(false);
              return;
            }
          }
          
          setUser(firebaseUser);
          setUserProfile(profile);
          setError('');

        } else {
          setError("Perfil de usuário não encontrado.");
          await signOut(auth);
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const logIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Email ou senha inválidos.");
      setIsLoading(false);
    }
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  }, []);

  const value = useMemo(() => ({
    user,
    userProfile,
    isAuthenticated: !!user,
    isLoading,
    error,
    logIn,
    logOut,
  }), [user, userProfile, isLoading, error, logIn, logOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
