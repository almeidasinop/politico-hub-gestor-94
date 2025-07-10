import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';
import { useContatos, type NovoContato } from './use-contatos';

// 1. Adicionar o novo campo 'tipoVisita' à interface.
export interface Visita extends DocumentData {
  id: string;
  data: string;
  horario: string;
  localizacao: string;
  observacao: string;
  tipoVisita?: string; // Tipo da visita, ex: "Reunião com liderança"
  contatoId?: string;
  contatoNome?: string;
}

export type NovaVisitaPayload = {
    visitaData: Omit<Visita, 'id' | 'contatoId' | 'contatoNome'>;
    contatoId?: string;
    novoContatoData?: NovoContato;
};


export const useVisitas = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { contatos, isLoading: isLoadingContatos, addContato: criarNovoContato } = useContatos();

  const { data: visitas = [], isLoading: isLoadingVisitas, isError } = useQuery<Visita[]>({
    queryKey: ['visitas', userProfile?.gabineteId],
    queryFn: () => new Promise((resolve, reject) => {
      if (!userProfile?.gabineteId) return resolve([]);
      const visitasCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'visitas');
      const q = query(visitasCollection);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const visitasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visita));
        visitasData.sort((a, b) => new Date(`${b.data}T${b.horario}`).getTime() - new Date(`${a.data}T${a.horario}`).getTime());
        resolve(visitasData);
      }, reject);
      
      return unsubscribe;
    }),
    enabled: !!userProfile?.gabineteId,
  });

  // 2. Criar uma lista de tipos de visita únicos para usar no autocompletar.
  const tiposDeVisitaUnicos = useMemo(() => {
    if (!visitas) return [];
    const tipos = visitas
        .map(v => v.tipoVisita)
        .filter((tipo, index, self) => tipo && self.indexOf(tipo) === index); // Filtra valores únicos e não vazios
    return tipos as string[];
  }, [visitas]);

  const { mutate: addVisita, isPending: isAdding } = useMutation({
    mutationFn: async ({ visitaData, contatoId, novoContatoData }: NovaVisitaPayload) => {
      if (!userProfile?.gabineteId) throw new Error("Gabinete do utilizador não encontrado.");

      let finalContatoId = contatoId;
      let finalContatoNome = '';

      if (novoContatoData && novoContatoData.nome) {
        try {
            const newContactDocRef = await criarNovoContato(novoContatoData);
            finalContatoId = newContactDocRef.id;
            finalContatoNome = novoContatoData.nome;
        } catch (error) {
            console.error("Falha ao criar o novo contato:", error);
            throw new Error("Não foi possível criar o novo contato.");
        }
      } else if (finalContatoId) {
        const contatoExistente = contatos.find(c => c.id === finalContatoId);
        if (contatoExistente) {
            finalContatoNome = contatoExistente.nome;
        }
      }

      const visitaParaSalvar = {
        ...visitaData,
        contatoId: finalContatoId || '',
        contatoNome: finalContatoNome || '',
      };

      const visitasCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'visitas');
      return await addDoc(visitasCollection, visitaParaSalvar);
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Visita registrada com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['visitas', userProfile?.gabineteId] });
      queryClient.invalidateQueries({ queryKey: ['contatos', userProfile?.gabineteId] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Não foi possível registrar a visita: ${error.message}`, variant: "destructive" });
    }
  });
  
  const visitasAgrupadas = useMemo(() => {
    return visitas.reduce((acc, visita) => {
      const data = visita.data;
      if (!acc[data]) {
        acc[data] = [];
      }
      acc[data].push(visita);
      return acc;
    }, {} as { [key: string]: Visita[] });
  }, [visitas]);


  const formatarDataCompleta = (data: string) => {
    const dataObj = new Date(`${data}T00:00:00`);
    return dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return {
    visitasAgrupadas,
    contatos,
    tiposDeVisitaUnicos, // 3. Exportar a lista para a UI
    isLoading: isLoadingVisitas || isLoadingContatos,
    isError,
    addVisita,
    isAdding,
    formatarDataCompleta,
  };
};
