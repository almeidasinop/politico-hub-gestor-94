import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';
import { useContatos } from './use-contatos';

// Interface para um Compromisso
export interface Compromisso extends DocumentData {
  id: string;
  data: string;
  horario: string;
  local: string;
  descricao: string;
  tipo: 'reuniao' | 'evento' | 'visita' | 'sessao';
  assessor: string;
}

export type NovoCompromisso = Omit<Compromisso, 'id'>;

// Hook customizado para gerir a lógica da agenda
export const useAgenda = () => {
  const { userProfile } = useAuth(); // Obtém o perfil do utilizador, que contém o gabineteId
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { contatos, isLoading: isLoadingContatos } = useContatos();

  // Busca os compromissos em tempo real, agora usando o gabineteId
  const { data: compromissos = [], isLoading: isLoadingAgenda, isError } = useQuery<Compromisso[]>({
    queryKey: ['agenda', userProfile?.gabineteId], // Chave de query depende do gabinete
    queryFn: () => new Promise((resolve, reject) => {
      if (!userProfile?.gabineteId) return resolve([]);
      
      // Caminho da coleção agora aponta para /gabinetes/{gabineteId}/agenda
      const agendaCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'agenda');
      const q = query(agendaCollection);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const compromissosData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Compromisso));
        
        compromissosData.sort((a, b) => {
          const dateTimeA = new Date(`${a.data}T${a.horario}`);
          const dateTimeB = new Date(`${b.data}T${b.horario}`);
          return dateTimeA.getTime() - dateTimeB.getTime();
        });

        resolve(compromissosData);
      }, reject);
      
      return unsubscribe;
    }),
    enabled: !!userProfile?.gabineteId, // A query só é ativada se houver um gabineteId
  });

  // Mutação para adicionar um novo compromisso no gabinete correto
  const { mutate: addCompromisso, isPending: isAdding } = useMutation({
    mutationFn: async (novoCompromisso: NovoCompromisso) => {
      if (!userProfile?.gabineteId) throw new Error("Gabinete do utilizador não encontrado.");
      const agendaCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'agenda');
      return await addDoc(agendaCollection, novoCompromisso);
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Compromisso agendado com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['agenda', userProfile?.gabineteId] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Não foi possível agendar o compromisso: ${error.message}`, variant: "destructive" });
    }
  });
  
  // A lógica para encontrar assessores e agrupar compromissos permanece a mesma
  const assessores = useMemo(() => {
    return contatos
      .filter(contato => contato.cargo === 'Assessor')
      .map(assessor => ({ id: assessor.id, nome: assessor.nome }));
  }, [contatos]);

  const compromissosAgrupados = useMemo(() => {
    return compromissos.reduce((acc, compromisso) => {
      const data = compromisso.data;
      if (!acc[data]) {
        acc[data] = [];
      }
      acc[data].push(compromisso);
      return acc;
    }, {} as { [key: string]: Compromisso[] });
  }, [compromissos]);
  
  // Funções utilitárias
  const formatarDataCompleta = (data: string) => {
    const dataObj = new Date(`${data}T00:00:00`);
    return dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getCorTipo = (tipo: string) => {
    const cores: { [key: string]: string } = { 'reuniao': 'bg-political-blue', 'evento': 'bg-political-gold', 'visita': 'bg-green-500', 'sessao': 'bg-purple-500' };
    return cores[tipo] || 'bg-gray-500';
  };

  const getNomeTipo = (tipo: string) => {
    const nomes: { [key: string]: string } = { 'reuniao': 'Reunião', 'evento': 'Evento', 'visita': 'Visita', 'sessao': 'Sessão' };
    return nomes[tipo] || tipo;
  };

  return {
    compromissosAgrupados,
    isLoading: isLoadingAgenda || isLoadingContatos,
    isError,
    addCompromisso,
    isAdding,
    assessores,
    formatarDataCompleta,
    getCorTipo,
    getNomeTipo,
  };
};
