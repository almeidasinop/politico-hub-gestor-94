import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './use-auth';

// Define a interface para um membro da equipa para segurança de tipos
interface TeamMember {
  uid: string;
  [key: string]: any; // Permite outras propriedades
}

export const useConfiguracoes = () => {
  const [equipe, setEquipe] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    // Se não houver um gabineteId, não há o que buscar.
    if (!userProfile?.gabineteId) {
      setIsLoading(false);
      return;
    }

    // Cria a consulta para buscar todos os utilizadores do mesmo gabinete.
    const q = query(collection(db, "users"), where("gabineteId", "==", userProfile.gabineteId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // CORREÇÃO: Mapeia os documentos e adiciona o ID de cada um como a propriedade 'uid'.
      // Esta é a correção principal que resolve o erro.
      const teamData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as TeamMember));
      
      setEquipe(teamData);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar equipa:", error);
      setIsError(true);
      setIsLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, [userProfile]);

  return { equipe, isLoading, isError };
};
