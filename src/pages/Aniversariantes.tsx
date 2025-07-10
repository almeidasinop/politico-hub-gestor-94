import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAniversariantes } from '@/hooks/use-aniversariantes';
import { Skeleton } from '@/components/ui/skeleton';
import { Contato } from '@/hooks/use-contatos';

// Componente reutilizável para exibir um card de aniversariante
const CardAniversariante = ({ pessoa, getCorCargo, hoje = false }: { pessoa: Contato, getCorCargo: (cargo: string) => string, hoje?: boolean }) => {
  const { toast } = useToast();

  const enviarParabens = (p: Contato) => {
    toast({
      title: "Parabéns enviados!",
      description: `Mensagem de parabéns enviada para ${p.nome}`,
    });
  };

  const criarLembrete = (p: Contato) => {
    toast({
      title: "Lembrete criado!",
      description: `Lembrete criado para o aniversário de ${p.nome}`,
    });
  };

  // Formata a data para DD/MM
  const formatarDataCard = (aniversario: string) => {
    if (!aniversario) return '';
    const [_, mes, dia] = aniversario.split('-');
    return `${dia}/${mes}`;
  }

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border ${hoje ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}`}
    >
      <div className="flex items-center gap-4">
        <div className="text-2xl">{hoje ? '🎂' : '🎁'}</div>
        <div>
          <h3 className="font-semibold text-political-navy">{pessoa.nome}</h3>
          <p className="text-sm text-muted-foreground">{pessoa.telefone}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`${getCorCargo(pessoa.cargo)} text-white text-xs`}>{pessoa.cargo}</Badge>
            <span className="text-xs text-muted-foreground">{formatarDataCard(pessoa.aniversario)} - {pessoa.idade} anos</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {hoje ? (
          <>
            <Button size="sm" onClick={() => enviarParabens(pessoa)} className="bg-political-gold hover:bg-yellow-600 text-white">
              <Mail className="mr-2 h-4 w-4" /> Enviar Parabéns
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}?text=Parabéns pelo seu aniversário! 🎉`, '_blank')}>
              WhatsApp
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => criarLembrete(pessoa)}>
            Criar Lembrete
          </Button>
        )}
      </div>
    </div>
  );
};


const Aniversariantes = () => {
  // Consome o hook para obter os dados já processados
  const { 
    aniversariantesDeHoje, 
    proximosAniversarios, 
    totalAniversariantesEsteMes,
    isLoading,
    isError,
    getCorCargo
  } = useAniversariantes();
  
  const hojeFormatado = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  // Exibe um estado de carregamento enquanto os contactos são buscados
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exibe uma mensagem de erro se a busca de dados falhar
  if (isError) {
    return (
      <Card className="bg-red-50 border-red-200 text-red-800">
        <CardContent className="text-center py-8 flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Ocorreu um erro ao buscar os dados de aniversariantes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-political-navy">Aniversariantes</h1>
        <p className="text-muted-foreground">Gerencie e celebre os aniversários dos seus contatos</p>
      </div>

      <Card className="border-l-4 border-l-political-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-political-gold" /> Aniversariantes de Hoje ({aniversariantesDeHoje.length})</CardTitle>
          <CardDescription>Pessoas que fazem aniversário hoje - {hojeFormatado}</CardDescription>
        </CardHeader>
        <CardContent>
          {aniversariantesDeHoje.length > 0 ? (
            <div className="space-y-4">
              {aniversariantesDeHoje.map((pessoa) => (
                <CardAniversariante key={pessoa.id} pessoa={pessoa} getCorCargo={getCorCargo} hoje />
              ))}
            </div>
          ) : <p className="text-muted-foreground">Nenhum aniversariante hoje.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-political-blue" /> Próximos Aniversários</CardTitle>
          <CardDescription>Aniversários dos próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
           {proximosAniversarios.length > 0 ? (
            <div className="space-y-3">
              {proximosAniversarios.map((pessoa) => (
                <CardAniversariante key={pessoa.id} pessoa={pessoa} getCorCargo={getCorCargo} />
              ))}
            </div>
          ) : <p className="text-muted-foreground">Nenhum aniversário nos próximos dias.</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-political-blue">{aniversariantesDeHoje.length}</CardTitle>
            <CardDescription>Aniversários Hoje</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-political-gold">{proximosAniversarios.length}</CardTitle>
            <CardDescription>Próximos 7 Dias</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">{totalAniversariantesEsteMes}</CardTitle>
            <CardDescription>Este Mês</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Aniversariantes;
