import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';

// --- Definição de Tipos ---
export interface Contato {
  id: string;
  nome: string;
  telefone: string;
  aniversario: string;
  cargo: string;
  observacoes: string;
}
export type NovoContato = Omit<Contato, 'id'>;

// --- Hook useContatos ---
export const useContatos = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('todos'); // Estado para o filtro de cargo

  // Busca os contatos em tempo real
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
        } as Contato)).sort((a, b) => a.nome.localeCompare(b.nome));
        resolve(contatosData);
      }, reject);
      return () => unsubscribe();
    }),
    enabled: !!userProfile?.gabineteId,
  });

  // Mutação para adicionar um novo contato
  const addContatoMutation = useMutation({
    mutationFn: async (novoContato: NovoContato) => {
      if (!userProfile?.gabineteId) throw new Error("Gabinete do usuário não encontrado.");
      const contatosCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'contatos');
      return await addDoc(contatosCollection, novoContato);
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Contato adicionado com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['contatos', userProfile?.gabineteId] });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Não foi possível adicionar o contato: ${error.message}`, variant: "destructive" });
    }
  });

  // Mutação para atualizar um contato existente
  const updateContatoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: NovoContato }) => {
        if (!userProfile?.gabineteId) throw new Error("Gabinete do usuário não encontrado.");
        const contatoDocRef = doc(db, 'gabinetes', userProfile.gabineteId, 'contatos', id);
        return await updateDoc(contatoDocRef, data);
    },
    onSuccess: () => {
        toast({ title: "Sucesso!", description: "Contato atualizado com sucesso." });
        queryClient.invalidateQueries({ queryKey: ['contatos', userProfile?.gabineteId] });
    },
    onError: (error: Error) => {
        toast({ title: "Erro", description: `Não foi possível atualizar o contato: ${error.message}`, variant: "destructive" });
    }
  });

  // Mutação para deletar um contato
  const deleteContatoMutation = useMutation({
    mutationFn: async (id: string) => {
        if (!userProfile?.gabineteId) throw new Error("Gabinete do usuário não encontrado.");
        const contatoDocRef = doc(db, 'gabinetes', userProfile.gabineteId, 'contatos', id);
        return await deleteDoc(contatoDocRef);
    },
    onSuccess: () => {
        toast({ title: "Sucesso!", description: "Contato excluído com sucesso." });
        queryClient.invalidateQueries({ queryKey: ['contatos', userProfile?.gabineteId] });
    },
    onError: (error: Error) => {
        toast({ title: "Erro", description: `Não foi possível excluir o contato: ${error.message}`, variant: "destructive" });
    }
  });
  
  // Lógica de filtro que combina busca por nome e filtro por cargo
  const filteredContatos = contatos.filter(contato => {
    const searchMatch = (contato.nome || '').toLowerCase().includes(searchTerm.toLowerCase());
    const cargoMatch = filtroCargo === 'todos' || contato.cargo === filtroCargo;
    return searchMatch && cargoMatch;
  });
  
  const formatarData = (data: string) => data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado';

  const getCorCargo = (cargo: string) => {
    const cores: { [key: string]: string } = {
      'Assessor': 'bg-blue-500', 'Jornalista': 'bg-green-500',
      'Eleitor': 'bg-yellow-500', 'Empresário': 'bg-purple-500', 'Funcionário Público': 'bg-gray-500'
    };
    return cores[cargo] || 'bg-slate-500';
  };

  // Retorno completo do hook
  return {
    contatos: filteredContatos, 
    isLoading, 
    isError, 
    addContato: addContatoMutation.mutate, 
    updateContato: updateContatoMutation.mutate,
    deleteContato: deleteContatoMutation.mutate,
    isAdding: addContatoMutation.isPending,
    isUpdating: updateContatoMutation.isPending,
    isDeleting: deleteContatoMutation.isPending,
    searchTerm, 
    setSearchTerm, 
    filtroCargo,
    setFiltroCargo,
    formatarData, 
    getCorCargo,
  };
};
