import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';

// Tipos para o status e os dados da Matéria
export type MateriaStatus = 'Aguardando' | 'Aprovado' | 'Rejeitado' | 'Atendida';

export interface Materia extends DocumentData {
  id: string;
  titulo: string;
  descricao: string;
  linkArquivo?: string;
  status: MateriaStatus;
  observacoes: string;
  dataSubmissao: string;
}

export type NovaMateria = Omit<Materia, 'id'>;

// Hook customizado para gerir a lógica de Matérias
export const useMaterias = () => {
  const { userProfile } = useAuth(); // Obtém o perfil do utilizador com o gabineteId
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<MateriaStatus | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Busca as matérias em tempo real do gabinete correto
  const { data: materias = [], isLoading, isError } = useQuery<Materia[]>({
    queryKey: ['materias', userProfile?.gabineteId], // Chave de query depende do gabinete
    queryFn: () => new Promise((resolve, reject) => {
      if (!userProfile?.gabineteId) return resolve([]);
      
      // Caminho da coleção agora aponta para /gabinetes/{gabineteId}/materias
      const materiasCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'materias');
      const q = query(materiasCollection);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const materiasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Materia));
        materiasData.sort((a, b) => new Date(b.dataSubmissao).getTime() - new Date(a.dataSubmissao).getTime());
        resolve(materiasData);
      }, reject);

      return unsubscribe;
    }),
    enabled: !!userProfile?.gabineteId, // A query só é ativada se houver um gabineteId
  });

  // Mutação para adicionar uma nova matéria no gabinete correto
  const { mutate: addMateria, isPending: isAdding } = useMutation({
    mutationFn: (novaMateria: NovaMateria) => {
      if (!userProfile?.gabineteId) throw new Error("Gabinete do utilizador não encontrado.");
      const materiasCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'materias');
      return addDoc(materiasCollection, novaMateria);
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Matéria cadastrada com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['materias', userProfile?.gabineteId] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Não foi possível cadastrar a matéria: ${error.message}`, variant: "destructive" });
    }
  });

  // Filtra as matérias com base nos filtros ativos
  const materiasFiltradas = useMemo(() => {
    return materias.filter(materia => {
      const matchesStatus = filtroStatus === 'todos' || materia.status === filtroStatus;
      const matchesSearch = materia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           materia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [materias, filtroStatus, searchTerm]);
  
  // Calcula as estatísticas das matérias
  const estatisticas = useMemo(() => ({
    total: materias.length,
    aguardando: materias.filter(m => m.status === 'Aguardando').length,
    aprovadas: materias.filter(m => m.status === 'Aprovado').length,
    rejeitadas: materias.filter(m => m.status === 'Rejeitado').length,
    atendidas: materias.filter(m => m.status === 'Atendida').length,
  }), [materias]);

  return {
    materiasFiltradas,
    isLoading,
    isError,
    addMateria,
    isAdding,
    filtroStatus,
    setFiltroStatus,
    searchTerm,
    setSearchTerm,
    estatisticas,
  };
};
