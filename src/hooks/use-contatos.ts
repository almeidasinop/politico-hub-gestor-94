import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, type UseMutateAsyncFunction } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, DocumentData, DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';

export interface Contato extends DocumentData {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
  cargo: string;
  observacoes: string;
}

export type NovoContato = Omit<Contato, 'id'>;

interface UseContatosReturn {
    contatos: Contato[];
    isLoading: boolean;
    isError: boolean;
    addContato: UseMutateAsyncFunction<DocumentReference<DocumentData>, Error, NovoContato, unknown>;
    isAdding: boolean;
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    formatarData: (data: string) => string;
    getCorCargo: (cargo: string) => string;
}

export const useContatos = (): UseContatosReturn => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: contatos = [], isLoading, isError } = useQuery<Contato[]>({
    queryKey: ['contatos', userProfile?.gabineteId],
    queryFn: () => new Promise((resolve, reject) => {
      if (!userProfile?.gabineteId) {
        return resolve([]);
      }
      
      const contatosCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'contatos');
      const q = query(contatosCollection);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const contatosData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Contato));
        resolve(contatosData);
      }, reject);
      
      return unsubscribe;
    }),
    enabled: !!userProfile?.gabineteId,
  });

  const addContatoMutation = useMutation({
    mutationFn: async (novoContato: NovoContato) => {
      if (!userProfile?.gabineteId) {
        throw new Error("Gabinete do utilizador não encontrado.");
      }
      const contatosCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'contatos');
      return await addDoc(contatosCollection, novoContato);
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Contacto adicionado com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['contatos', userProfile?.gabineteId] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Não foi possível adicionar o contacto: ${error.message}`, variant: "destructive" });
    }
  });
  
  // CORREÇÃO: Adicionada verificação para campos que podem ser nulos ou indefinidos.
  const filteredContatos = contatos.filter(contato =>
    (contato.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contato.cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatarData = (data: string) => new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

  const getCorCargo = (cargo: string) => {
    const cores: { [key: string]: string } = {
      'Assessor': 'bg-political-blue', 'Jornalista': 'bg-political-gold',
      'Eleitor': 'bg-green-500', 'Empresário': 'bg-purple-500', 'Funcionário Público': 'bg-gray-500'
    };
    return cores[cargo] || 'bg-gray-400';
  };

  return {
    contatos: filteredContatos, 
    isLoading, 
    isError, 
    addContato: addContatoMutation.mutateAsync, 
    isAdding: addContatoMutation.isPending,
    searchTerm, 
    setSearchTerm, 
    formatarData, 
    getCorCargo,
  };
};
