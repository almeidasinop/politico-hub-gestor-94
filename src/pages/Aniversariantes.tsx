
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Aniversariante {
  id: number;
  nome: string;
  telefone: string;
  aniversario: string;
  cargo: string;
  idade: number;
}

const Aniversariantes = () => {
  const { toast } = useToast();

  // Simulando dados de aniversariantes
  const aniversariantes: Aniversariante[] = [
    {
      id: 1,
      nome: 'Maria Santos',
      telefone: '(11) 99999-9999',
      aniversario: '06/12',
      cargo: 'Assessora',
      idade: 34
    },
    {
      id: 2,
      nome: 'Carlos Oliveira',
      telefone: '(11) 88888-8888',
      aniversario: '06/12',
      cargo: 'Jornalista',
      idade: 44
    },
    {
      id: 3,
      nome: 'Ana Costa',
      telefone: '(11) 77777-7777',
      aniversario: '06/12',
      cargo: 'Eleitora',
      idade: 52
    }
  ];

  const proximosAniversarios = [
    {
      id: 4,
      nome: 'João Silva',
      telefone: '(11) 66666-6666',
      aniversario: '07/12',
      cargo: 'Empresário',
      idade: 38
    },
    {
      id: 5,
      nome: 'Lucia Fernandes',
      telefone: '(11) 55555-5555',
      aniversario: '08/12',
      cargo: 'Funcionária Pública',
      idade: 29
    },
    {
      id: 6,
      nome: 'Roberto Mendes',
      telefone: '(11) 44444-4444',
      aniversario: '10/12',
      cargo: 'Assessor',
      idade: 41
    }
  ];

  const enviarParabens = (aniversariante: Aniversariante) => {
    toast({
      title: "Parabéns enviados!",
      description: `Mensagem de parabéns enviada para ${aniversariante.nome}`,
    });
  };

  const getCorCargo = (cargo: string) => {
    const cores: { [key: string]: string } = {
      'Assessor': 'bg-political-blue',
      'Assessora': 'bg-political-blue',
      'Jornalista': 'bg-political-gold',
      'Eleitor': 'bg-green-500',
      'Eleitora': 'bg-green-500',
      'Empresário': 'bg-purple-500',
      'Funcionária Pública': 'bg-gray-500'
    };
    return cores[cargo] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-political-navy">Aniversariantes</h1>
        <p className="text-muted-foreground">Gerencie e celebre os aniversários dos seus contatos</p>
      </div>

      {/* Aniversariantes de hoje */}
      <Card className="border-l-4 border-l-political-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-political-gold" />
            Aniversariantes de Hoje ({aniversariantes.length})
          </CardTitle>
          <CardDescription>
            Pessoas que fazem aniversário hoje - 06 de Dezembro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aniversariantes.map((pessoa) => (
              <div 
                key={pessoa.id} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🎂</div>
                  <div>
                    <h3 className="font-semibold text-political-navy">{pessoa.nome}</h3>
                    <p className="text-sm text-muted-foreground">{pessoa.telefone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getCorCargo(pessoa.cargo)} text-white text-xs`}>
                        {pessoa.cargo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{pessoa.idade} anos</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => enviarParabens(pessoa)}
                    className="bg-political-gold hover:bg-yellow-600 text-white"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Parabéns
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/55${pessoa.telefone.replace(/\D/g, '')}?text=Parabéns pelo seu aniversário! 🎉`, '_blank')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos aniversários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-political-blue" />
            Próximos Aniversários
          </CardTitle>
          <CardDescription>
            Aniversários dos próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proximosAniversarios.map((pessoa) => (
              <div 
                key={pessoa.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-political-blue rounded-full flex items-center justify-center text-white font-semibold">
                    {pessoa.aniversario.split('/')[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-political-navy">{pessoa.nome}</h4>
                    <p className="text-sm text-muted-foreground">{pessoa.telefone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getCorCargo(pessoa.cargo)} text-white text-xs`}>
                        {pessoa.cargo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {pessoa.aniversario} - {pessoa.idade} anos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-political-navy">Em breve</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Lembrete criado!",
                        description: `Lembrete criado para o aniversário de ${pessoa.nome}`,
                      });
                    }}
                  >
                    Criar Lembrete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-political-blue">3</CardTitle>
            <CardDescription>Aniversários Hoje</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-political-gold">8</CardTitle>
            <CardDescription>Próximos 7 Dias</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">23</CardTitle>
            <CardDescription>Este Mês</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Aniversariantes;
