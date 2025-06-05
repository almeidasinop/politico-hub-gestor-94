
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, List } from 'lucide-react';

const Dashboard = () => {
  // Dados simulados para demonstração
  const stats = {
    totalContatos: 247,
    aniversariantesHoje: 3,
    despesasMes: 15420.50,
    compromissosHoje: 5,
    materiasAguardando: 8
  };

  const recentActivities = [
    { type: 'contato', description: 'João Silva adicionado aos contatos', time: '2h atrás' },
    { type: 'agenda', description: 'Reunião com equipe agendada para amanhã', time: '4h atrás' },
    { type: 'materia', description: 'PL 123/2025 teve status alterado para Aprovado', time: '6h atrás' },
    { type: 'contato', description: 'Maria Santos atualizada nos contatos', time: '1d atrás' }
  ];

  const todayBirthdays = [
    { name: 'Maria Santos', cargo: 'Assessora', phone: '(11) 99999-9999' },
    { name: 'Carlos Oliveira', cargo: 'Jornalista', phone: '(11) 88888-8888' },
    { name: 'Ana Costa', cargo: 'Eleitora', phone: '(11) 77777-7777' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-political-navy">Inicio</h1>
        <p className="text-muted-foreground">Visão geral do sistema de gestão política</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-political-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-political-navy">{stats.totalContatos}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-political-gold">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aniversariantes Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-political-gold">{stats.aniversariantesHoje}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compromissos Hoje</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.compromissosHoje}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aniversariantes do dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-political-gold" />
              Aniversariantes de Hoje
            </CardTitle>
            <CardDescription>
              Pessoas que fazem aniversário hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayBirthdays.map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-political-navy">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.cargo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{person.phone}</p>
                    <Badge variant="secondary" className="bg-political-gold text-white">
                      🎂 Aniversário
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividades recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-political-blue" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-political-blue rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-political-navy">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Matérias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-political-navy" />
            Status das Matérias Legislativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.materiasAguardando}</div>
              <div className="text-sm text-muted-foreground">Aguardando</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-muted-foreground">Aprovadas</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-muted-foreground">Rejeitadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
