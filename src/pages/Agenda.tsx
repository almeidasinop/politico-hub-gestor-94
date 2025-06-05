
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock } from 'lucide-react';

interface Compromisso {
  id: number;
  data: string;
  horario: string;
  local: string;
  descricao: string;
  tipo: 'reuniao' | 'evento' | 'visita' | 'sessao';
}

const Agenda = () => {
  const [compromissos, setCompromissos] = useState<Compromisso[]>([
    {
      id: 1,
      data: '2024-12-06',
      horario: '09:00',
      local: 'Gabinete Municipal',
      descricao: 'Reunião com equipe de assessores',
      tipo: 'reuniao'
    },
    {
      id: 2,
      data: '2024-12-06',
      horario: '14:00',
      local: 'Câmara Municipal',
      descricao: 'Sessão ordinária da Câmara',
      tipo: 'sessao'
    },
    {
      id: 3,
      data: '2024-12-06',
      horario: '16:30',
      local: 'Centro Comunitário',
      descricao: 'Visita ao projeto social do bairro',
      tipo: 'visita'
    },
    {
      id: 4,
      data: '2024-12-07',
      horario: '10:00',
      local: 'Hotel Central',
      descricao: 'Congresso de Gestão Pública',
      tipo: 'evento'
    },
    {
      id: 5,
      data: '2024-12-07',
      horario: '15:00',
      local: 'Secretaria de Obras',
      descricao: 'Reunião sobre obras de infraestrutura',
      tipo: 'reuniao'
    }
  ]);

  const [novoCompromisso, setNovoCompromisso] = useState({
    data: '',
    horario: '',
    local: '',
    descricao: '',
    tipo: 'reuniao' as const
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoCompromisso.data || !novoCompromisso.horario || !novoCompromisso.local || !novoCompromisso.descricao) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const novoId = Math.max(...compromissos.map(c => c.id), 0) + 1;
    const compromisso: Compromisso = {
      id: novoId,
      ...novoCompromisso
    };

    setCompromissos([...compromissos, compromisso].sort((a, b) => {
      const dataA = new Date(a.data + 'T' + a.horario);
      const dataB = new Date(b.data + 'T' + b.horario);
      return dataA.getTime() - dataB.getTime();
    }));

    setNovoCompromisso({
      data: '',
      horario: '',
      local: '',
      descricao: '',
      tipo: 'reuniao'
    });
    setIsDialogOpen(false);

    toast({
      title: "Sucesso!",
      description: "Compromisso agendado com sucesso.",
    });
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCorTipo = (tipo: string) => {
    const cores: { [key: string]: string } = {
      'reuniao': 'bg-political-blue',
      'evento': 'bg-political-gold',
      'visita': 'bg-green-500',
      'sessao': 'bg-purple-500'
    };
    return cores[tipo] || 'bg-gray-500';
  };

  const getNomeTipo = (tipo: string) => {
    const nomes: { [key: string]: string } = {
      'reuniao': 'Reunião',
      'evento': 'Evento',
      'visita': 'Visita',
      'sessao': 'Sessão'
    };
    return nomes[tipo] || tipo;
  };

  // Agrupar compromissos por data
  const compromissosAgrupados = compromissos.reduce((grupos, compromisso) => {
    const data = compromisso.data;
    if (!grupos[data]) {
      grupos[data] = [];
    }
    grupos[data].push(compromisso);
    return grupos;
  }, {} as { [key: string]: Compromisso[] });

  // Ordenar as datas
  const datasOrdenadas = Object.keys(compromissosAgrupados).sort();

  const hoje = new Date().toISOString().split('T')[0];
  const compromissosHoje = compromissosAgrupados[hoje] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Agenda de Compromissos</h1>
          <p className="text-muted-foreground">Gerencie seus compromissos e eventos políticos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-political-blue hover:bg-political-navy">
              <Calendar className="mr-2 h-4 w-4" />
              Novo Compromisso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Novo Compromisso</DialogTitle>
              <DialogDescription>
                Cadastre um novo compromisso na agenda
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novoCompromisso.data}
                    onChange={(e) => setNovoCompromisso({...novoCompromisso, data: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario">Horário *</Label>
                  <Input
                    id="horario"
                    type="time"
                    value={novoCompromisso.horario}
                    onChange={(e) => setNovoCompromisso({...novoCompromisso, horario: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="local">Local *</Label>
                <Input
                  id="local"
                  value={novoCompromisso.local}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, local: e.target.value})}
                  placeholder="Digite o local do compromisso"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo do Compromisso *</Label>
                <select
                  id="tipo"
                  value={novoCompromisso.tipo}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, tipo: e.target.value as any})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="reuniao">Reunião</option>
                  <option value="evento">Evento</option>
                  <option value="visita">Visita</option>
                  <option value="sessao">Sessão</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={novoCompromisso.descricao}
                  onChange={(e) => setNovoCompromisso({...novoCompromisso, descricao: e.target.value})}
                  placeholder="Descreva o compromisso"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy">
                  Agendar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compromissos de hoje */}
      <Card className="border-l-4 border-l-political-gold">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-political-gold" />
            Compromissos de Hoje ({compromissosHoje.length})
          </CardTitle>
          <CardDescription>
            {formatarData(hoje)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {compromissosHoje.length > 0 ? (
            <div className="space-y-3">
              {compromissosHoje
                .sort((a, b) => a.horario.localeCompare(b.horario))
                .map((compromisso) => (
                  <div 
                    key={compromisso.id} 
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold text-political-navy">{compromisso.horario}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-political-navy">{compromisso.descricao}</h4>
                        <Badge className={`${getCorTipo(compromisso.tipo)} text-white`}>
                          {getNomeTipo(compromisso.tipo)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        📍 {compromisso.local}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhum compromisso agendado para hoje.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-political-blue">{compromissosHoje.length}</CardTitle>
            <CardDescription>Hoje</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-political-gold">
              {compromissos.filter(c => c.tipo === 'reuniao').length}
            </CardTitle>
            <CardDescription>Reuniões</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              {compromissos.filter(c => c.tipo === 'evento').length}
            </CardTitle>
            <CardDescription>Eventos</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-600">{compromissos.length}</CardTitle>
            <CardDescription>Total</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Agenda completa */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda Completa</CardTitle>
          <CardDescription>Todos os compromissos agendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {datasOrdenadas.map((data) => (
              <div key={data}>
                <h3 className="text-lg font-semibold text-political-navy mb-3 border-b pb-2">
                  {formatarData(data)}
                </h3>
                <div className="space-y-2">
                  {compromissosAgrupados[data]
                    .sort((a, b) => a.horario.localeCompare(b.horario))
                    .map((compromisso) => (
                      <div 
                        key={compromisso.id} 
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-center min-w-[60px]">
                          <div className="font-medium text-political-navy">{compromisso.horario}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-political-navy">{compromisso.descricao}</h4>
                            <Badge className={`${getCorTipo(compromisso.tipo)} text-white`}>
                              {getNomeTipo(compromisso.tipo)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            📍 {compromisso.local}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {datasOrdenadas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum compromisso agendado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;
