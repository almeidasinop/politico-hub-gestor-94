import { useMemo } from 'react';
import { useContatos } from './use-contatos';
import { useAniversariantes } from './use-aniversariantes';
import { useDespesas } from './use-despesas';
import { useAgenda } from './use-agenda';
import { useMaterias } from './use-materias';
import { useVisitas } from './use-visitas';

// Um tipo unificado para representar qualquer atividade no sistema
export interface Activity {
  id: string;
  type: 'visita' | 'matéria' | 'despesa' | 'agenda' | 'contato';
  title: string;
  description: string;
  timestamp: string; // Usaremos a data da atividade como timestamp
}

export const useDashboardStats = () => {
    // 1. Consome todos os hooks de dados
    const { contatos, isLoading: isLoadingContatos } = useContatos();
    const { aniversariantesDeHoje, isLoading: isLoadingAniversariantes, getCorCargo } = useAniversariantes();
    const { despesasFiltradas, isLoading: isLoadingDespesas } = useDespesas();
    const { compromissosAgrupados, isLoading: isLoadingAgenda } = useAgenda();
    const { materiasFiltradas, isLoading: isLoadingMaterias } = useMaterias();
    const { visitasAgrupadas, isLoading: isLoadingVisitas, formatarDataCompleta } = useVisitas();

    const isLoading = isLoadingContatos || isLoadingAniversariantes || isLoadingDespesas || isLoadingAgenda || isLoadingMaterias || isLoadingVisitas;

    // 2. O useMemo agora também irá processar e unificar todas as atividades
    const { stats, recentActivities } = useMemo(() => {
        const hojeISO = new Date().toISOString().split('T')[0];
        const compromissosHoje = compromissosAgrupados[hojeISO] || [];
        const visitasHoje = visitasAgrupadas[hojeISO] || [];
        
        // Mapeia cada tipo de dado para o formato de Activity
        const visitas = Object.values(visitasAgrupadas).flat().map(v => ({ id: v.id, type: 'visita', title: v.tipoVisita || 'Visita', description: v.localizacao, timestamp: v.data } as Activity));
        const materias = materiasFiltradas.map(m => ({ id: m.id, type: 'matéria', title: `Matéria: ${m.titulo}`, description: `Status: ${m.status}`, timestamp: m.dataSubmissao } as Activity));
        const despesas = despesasFiltradas.map(d => ({ id: d.id, type: 'despesa', title: `Despesa: ${d.descricao}`, description: `R$ ${d.valor.toFixed(2)}`, timestamp: d.data } as Activity));
        
        // Combina todos os arrays de atividades
        const allActivities = [...visitas, ...materias, ...despesas];
        
        // Ordena todas as atividades pela data, da mais recente para a mais antiga
        allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const calculatedStats = {
            totalContatos: contatos?.length ?? 0,
            aniversariantesHoje: aniversariantesDeHoje?.length ?? 0,
            visitasHoje: visitasHoje.length,
            compromissosHoje: compromissosHoje.length,
            despesasMes: despesasFiltradas.filter(d => d.data.startsWith(hojeISO.substring(0, 7))).reduce((sum, d) => sum + d.valor, 0),
            materiasAguardando: materiasFiltradas.filter(m => m.status === 'Aguardando').length,
            materiasAprovadas: materiasFiltradas.filter(m => m.status === 'Aprovado').length,
            materiasRejeitadas: materiasFiltradas.filter(m => m.status === 'Rejeitado').length,
            materiasAtendidas: materiasFiltradas.filter(m => m.status === 'Atendida').length,
        };
        
        // Retorna as 5 atividades mais recentes
        return { stats: calculatedStats, recentActivities: allActivities.slice(0, 5) };

    }, [ contatos, aniversariantesDeHoje, despesasFiltradas, compromissosAgrupados, materiasFiltradas, visitasAgrupadas ]);

    return {
        stats,
        todayBirthdays: aniversariantesDeHoje,
        recentActivities, // Exporta o novo array de atividades
        getCorCargo,
        formatarDataCompleta,
        isLoading,
    };
};
