import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import { useToast } from '@/components/ui/use-toast';

// Interfaces para os tipos de dados de Despesa
export interface Despesa extends DocumentData {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
}

export type NovaDespesa = Omit<Despesa, 'id'>;

// Lista de categorias disponíveis
export const categoriasDespesa = ['Transporte', 'Material', 'Alimentação', 'Viagem', 'Comunicação', 'Consultoria', 'Outros'];

// Hook customizado para gerir a lógica de despesas
export const useDespesas = () => {
  const { userProfile } = useAuth(); // Obtém o perfil do utilizador com o gabineteId
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Busca as despesas em tempo real do gabinete correto
  const { data: despesas = [], isLoading, isError } = useQuery<Despesa[]>({
    queryKey: ['despesas', userProfile?.gabineteId], // Chave de query depende do gabinete
    queryFn: () => new Promise((resolve, reject) => {
      if (!userProfile?.gabineteId) return resolve([]);
      
      // Caminho da coleção agora aponta para /gabinetes/{gabineteId}/despesas
      const despesasCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'despesas');
      const q = query(despesasCollection);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const despesasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Despesa));
        // Ordena as despesas da mais recente para a mais antiga
        despesasData.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        resolve(despesasData);
      }, reject);
      
      return unsubscribe;
    }),
    enabled: !!userProfile?.gabineteId, // A query só é ativada se houver um gabineteId
  });

  // Mutação para adicionar uma nova despesa no gabinete correto
  const { mutate: addDespesa, isPending: isAdding } = useMutation({
    mutationFn: async (novaDespesa: NovaDespesa) => {
      if (!userProfile?.gabineteId) throw new Error("Gabinete do utilizador não encontrado.");
      // Converte o valor para número antes de guardar
      const despesaParaSalvar = { ...novaDespesa, valor: Number(novaDespesa.valor) };
      const despesasCollection = collection(db, 'gabinetes', userProfile.gabineteId, 'despesas');
      return await addDoc(despesasCollection, despesaParaSalvar);
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Despesa lançada com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['despesas', userProfile?.gabineteId] });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Não foi possível adicionar a despesa: ${error.message}`, variant: "destructive" });
    }
  });

  // Filtra as despesas com base na categoria selecionada
  const despesasFiltradas = useMemo(() => {
    return filtroCategoria === 'todas'
      ? despesas
      : despesas.filter(d => d.categoria === filtroCategoria);
  }, [despesas, filtroCategoria]);


  // Calcula as estatísticas usando useMemo para otimização
  const estatisticas = useMemo(() => {
    const hoje = new Date();
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    
    const totalMes = despesas
      .filter(d => d.data.startsWith(mesAtual))
      .reduce((sum, despesa) => sum + despesa.valor, 0);

    const totalGeral = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);

    const despesasPorCategoria = categoriasDespesa.map(categoria => ({
      categoria,
      total: despesas
        .filter(d => d.categoria === categoria)
        .reduce((sum, despesa) => sum + despesa.valor, 0)
    })).filter(item => item.total > 0);

    return { totalMes, totalGeral, totalRegistos: despesas.length, despesasPorCategoria };
  }, [despesas]);

  // Função para formatar data
  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return {
    despesasFiltradas,
    isLoading,
    isError,
    addDespesa,
    isAdding,
    filtroCategoria,
    setFiltroCategoria,
    estatisticas,
    formatarData,
  };
};
