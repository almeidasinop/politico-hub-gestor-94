import { useMemo } from 'react';
import { useContatos } from './use-contatos';
import type { Contato } from './use-contatos';

// Interface para um contacto processado com informações de aniversário
interface AniversarianteProcessado extends Contato {
    idade: number;
    diaMes: string; // formato MM-DD para facilitar a comparação e ordenação
}

// Função auxiliar para calcular a idade a partir da data de nascimento
const calcularIdade = (dataNascimento: string): number => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
};

// Hook principal para gerir a lógica dos aniversariantes
export const useAniversariantes = () => {
    // 1. Obtém todos os contactos. O hook `useContatos` já está ciente
    // do gabinete e irá fornecer apenas os contactos relevantes.
    const { contatos: todosContatos, isLoading, isError, getCorCargo } = useContatos();

    // 2. Processa e filtra os dados usando useMemo para otimizar o desempenho.
    // Esta lógica não precisa de mudar, pois já opera sobre a lista de contactos correta.
    const { hoje, proximos, esteMesCount } = useMemo(() => {
        if (!todosContatos) return { hoje: [], proximos: [], esteMesCount: 0 };

        // Mapeia todos os contactos para um formato mais útil para esta página
        const aniversariantesProcessados: AniversarianteProcessado[] = todosContatos
            .filter(c => c.aniversario) // Garante que só processamos contactos com data de aniversário
            .map(contato => ({
                ...contato,
                idade: calcularIdade(contato.aniversario),
                diaMes: contato.aniversario.substring(5) // Extrai 'MM-DD' de 'YYYY-MM-DD'
            }))
            .sort((a, b) => a.diaMes.localeCompare(b.diaMes)); // Ordena por data

        const dataAtual = new Date();
        const diaHoje = String(dataAtual.getDate()).padStart(2, '0');
        const mesHoje = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const hojeMMDD = `${mesHoje}-${diaHoje}`;
        
        const aniversariantesDeHoje: AniversarianteProcessado[] = [];
        const proximosAniversarios: AniversarianteProcessado[] = [];
        
        // Separa os aniversariantes em "hoje" e "próximos"
        aniversariantesProcessados.forEach(p => {
            if (p.diaMes === hojeMMDD) {
                aniversariantesDeHoje.push(p);
            } else if (p.diaMes > hojeMMDD) {
                proximosAniversarios.push(p);
            }
        });
        
        // Pega apenas os 7 próximos aniversários para não sobrecarregar a UI
        const proximos7dias = proximosAniversarios.slice(0, 7);

        // Conta quantos aniversários ocorrem no mês atual
        const totalNoMes = aniversariantesProcessados.filter(p => p.diaMes.startsWith(mesHoje)).length;
        
        return { hoje: aniversariantesDeHoje, proximos: proximos7dias, esteMesCount: totalNoMes };

    }, [todosContatos]);
    
    // 3. Devolve os dados prontos para serem consumidos pela UI
    return {
        aniversariantesDeHoje: hoje,
        proximosAniversarios: proximos,
        totalAniversariantesEsteMes: esteMesCount,
        isLoading,
        isError,
        getCorCargo, // Re-exporta a função para que a UI possa usá-la
    };
};
