import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  type User 
} from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db, firebaseInitialized } from '@/lib/firebase';
import { useToast } from "@/components/ui/use-toast";

// --- Tipos de Dados ---
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  gabineteId: string;
  role: 'admin' | 'assessor';
}

interface SignUpData {
  gabineteName: string;
  userName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provedor de Autenticação ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!firebaseInitialized) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Se já temos um perfil no estado, não o buscamos novamente para evitar a race condition.
        if (!userProfile || userProfile.uid !== currentUser.uid) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserProfile(userDoc.data() as UserProfile);
            }
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile]); // Adicionado userProfile como dependência

  const signIn = async (email: string, pass: string) => {
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Sucesso", description: "Login realizado com sucesso!" });
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({ title: "Erro de Login", description: "Email ou senha inválidos.", variant: "destructive" });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      const gabinetesCollection = collection(db, 'gabinetes');
      const gabineteDocRef = await addDoc(gabinetesCollection, {
        nome: data.gabineteName,
        createdAt: new Date().toISOString(),
        ownerId: newUser.uid,
      });
      
      const userProfileData: UserProfile = {
        uid: newUser.uid,
        name: data.userName,
        email: data.email,
        gabineteId: gabineteDocRef.id,
        role: 'admin',
      };
      await setDoc(doc(db, 'users', newUser.uid), userProfileData);

      // **A CORREÇÃO ESTÁ AQUI**
      // Definimos manualmente o perfil do utilizador no estado logo após a sua criação.
      // Isto evita a "race condition" com o onAuthStateChanged.
      setUserProfile(userProfileData);

      toast({ title: "Sucesso!", description: "Gabinete e utilizador registados com sucesso." });
    } catch (error: any) {
      console.error("Erro no registo:", error);
      let desc = "Ocorreu um erro inesperado.";
      if (error.code === 'auth/email-already-in-use') {
        desc = "Este email já está a ser utilizado por outra conta.";
      } else if (error.code === 'auth/weak-password') {
        desc = "A senha é muito fraca. Por favor, use pelo menos 6 caracteres.";
      }
      toast({ title: "Erro de Registo", description: desc, variant: "destructive" });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const logOut = async () => {
    await signOut(auth);
  };

  const value = { user, userProfile, isAuthenticated: !!user, isLoading, isAuthenticating, signIn, signUp, logOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
