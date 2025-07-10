import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from './use-auth'; // Importar o tipo de perfil de utilizador

// Este hook irá gerir os dados e as ações da página de configurações.
export const useConfiguracoes = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Busca todos os utilizadores que pertencem ao mesmo gabinete.
  const { data: equipe = [], isLoading, isError } = useQuery<UserProfile[]>({
    queryKey: ['equipe', userProfile?.gabineteId],
    queryFn: async () => {
      if (!userProfile?.gabineteId) return [];

      // NOTA: Esta query requer a criação de um índice composto no Firestore.
      // O Firebase irá fornecer um link para o criar automaticamente no erro da consola.
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where("gabineteId", "==", userProfile.gabineteId));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    },
    enabled: !!userProfile?.gabineteId,
  });
  
  // AINDA NÃO IMPLEMENTADO: A mutação para convidar um novo utilizador
  // seria adicionada aqui e chamaria a nossa Cloud Function.
  // Por agora, vamos focar-nos na UI.

  return {
    equipe,
    isLoading,
    isError,
    gabineteId: userProfile?.gabineteId
  };
};
