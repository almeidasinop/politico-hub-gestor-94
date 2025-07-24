import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User, ShieldCheck } from 'lucide-react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Badge } from '@/components/ui/badge';

const Configuracoes = () => {
  const { equipe, isLoading, isError, gabineteId } = useConfiguracoes();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-6 w-1/2" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-red-50 border-red-200 text-red-800">
        <CardContent className="text-center py-8 flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Ocorreu um erro ao carregar os dados da equipe.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-political-navy">Configurações do Gabinete</h1>
        <p className="text-muted-foreground">Gerencie a sua equipe e as configurações do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipe do Gabinete</CardTitle>
          <CardDescription>Utilizadores com acesso a este gabinete.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipe.map(membro => (
              <div key={membro.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-political-navy">{membro.name}</p>
                    <p className="text-sm text-muted-foreground">{membro.email}</p>
                  </div>
                </div>
                <Badge variant={membro.role === 'admin' ? 'default' : 'secondary'} className={membro.role === 'admin' ? 'bg-political-blue' : ''}>
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {membro.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
