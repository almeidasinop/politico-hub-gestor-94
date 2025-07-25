import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, List, MapPin, Activity as ActivityIcon } from 'lucide-react';
import { useDashboardStats, type Activity } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Contato } from '@/hooks/use-contatos';
import { useAuth } from '@/hooks/use-auth'; // Importar useAuth
import { db } from '@/lib/firebase'; // Importar db
import { doc, getDoc } from 'firebase/firestore'; // Importar getDoc

// Função para retornar um ícone com base no tipo de atividade
const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'visita': return <MapPin className="h-4 w-4 text-blue-500" />;
    case 'matéria': return <FileText className="h-4 w-4 text-orange-500" />;
    case 'despesa': return <List className="h-4 w-4 text-red-500" />;
    case 'agenda': return <Calendar className="h-4 w-4 text-purple-500" />;
    default: return <ActivityIcon className="h-4 w-4 text-gray-500" />;
  }
};

const Dashboard = () => {
  const { stats, todayBirthdays, recentActivities, getCorCargo, formatarDataCompleta, isLoading: isLoadingStats } = useDashboardStats();
  const { userProfile } = useAuth();
  const [gabineteNome, setGabineteNome] = useState('');
  const [isGabineteLoading, setIsGabineteLoading] = useState(true);

  useEffect(() => {
    const fetchGabineteNome = async () => {
      if (userProfile?.gabineteId) {
        try {
          const gabineteRef = doc(db, 'gabinetes', userProfile.gabineteId);
          const gabineteSnap = await getDoc(gabineteRef);
          if (gabineteSnap.exists()) {
            setGabineteNome(gabineteSnap.data().nome);
          }
        } catch (error) {
          console.error("Erro ao buscar nome do gabinete:", error);
        }
      }
      setIsGabineteLoading(false);
    };

    if (userProfile) {
        fetchGabineteNome();
    }
  }, [userProfile]);
  
  const isLoading = isLoadingStats || isGabineteLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Trecho de código modificado com a nova lógica */}
      <div>
        <h1 className="text-3xl font-bold text-political-navy">Início</h1>
        <p className="text-muted-foreground">
            Visão geral das atividades do gabinete <strong className="text-political-navy">{gabineteNome || 'não vinculado'}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-political-blue"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Contatos</CardTitle><User className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-political-navy">{stats.totalContatos}</div></CardContent></Card>
        <Card className="border-l-4 border-l-political-gold"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Aniversariantes Hoje</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-political-gold">{stats.aniversariantesHoje}</div></CardContent></Card>
        <Card className="border-l-4 border-l-teal-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Visitas Hoje</CardTitle><MapPin className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{stats.visitasHoje}</div></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Compromissos Hoje</CardTitle><List className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{stats.compromissosHoje}</div></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">R$ {stats.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent></Card>
      </div>

      {/* Grelha para Aniversariantes e Últimas Atividades lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-political-gold" />Aniversariantes de Hoje</CardTitle><CardDescription>Contatos que celebram hoje</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayBirthdays.length > 0 ? todayBirthdays.map((person: Contato) => (
                <div key={person.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-political-navy">{person.nome}</p>
                    <p className="text-sm text-muted-foreground">{person.cargo}</p>
                  </div>
                  <div className="text-right"><p className="text-sm font-medium">{person.telefone}</p><Badge variant="secondary" className={`${getCorCargo(person.cargo)} text-white`}>🎂 Aniversário</Badge></div>
                </div>
              )) : <p className="text-muted-foreground text-center py-4">Nenhum aniversariante hoje.</p>}
            </div>
          </CardContent>
        </Card>
        
        {/* CARD DE ATIVIDADES RECENTES */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ActivityIcon className="h-5 w-5 text-political-blue" />Atividades Recentes</CardTitle><CardDescription>Últimos registros no sistema</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? recentActivities.map((activity: Activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-political-navy">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatarDataCompleta(activity.timestamp)}</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-center py-4">Nenhuma atividade registrada recentemente.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Matérias a ocupar a largura total */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-political-navy" />Status das Matérias</CardTitle><CardDescription>Resumo do status das matérias cadastradas</CardDescription></CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="text-center p-4 bg-yellow-50 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{stats.materiasAguardando}</div><div className="text-sm text-muted-foreground">Aguardando</div></div>
             <div className="text-center p-4 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{stats.materiasAprovadas}</div><div className="text-sm text-muted-foreground">Aprovadas</div></div>
             <div className="text-center p-4 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{stats.materiasAtendidas}</div><div className="text-sm text-muted-foreground">Atendidas</div></div>
             <div className="text-center p-4 bg-red-50 rounded-lg"><div className="text-2xl font-bold text-red-600">{stats.materiasRejeitadas}</div><div className="text-sm text-muted-foreground">Rejeitadas</div></div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
