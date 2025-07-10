import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, AlertCircle, UserCheck } from 'lucide-react'; // Ícone novo
import { useAgenda, type NovoCompromisso } from '@/hooks/use-agenda';

const Agenda = () => {
  const {
    compromissosAgrupados,
    isLoading,
    isError,
    addCompromisso,
    isAdding,
    assessores, // Obter a lista de assessores do hook
    formatarDataCompleta,
    getCorTipo,
    getNomeTipo,
  } = useAgenda();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Adicionar o campo 'assessor' ao estado inicial
  const [novoCompromisso, setNovoCompromisso] = useState<NovoCompromisso>({
    data: '', horario: '', local: '', descricao: '', tipo: 'reuniao', assessor: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCompromisso.data || !novoCompromisso.horario || !novoCompromisso.local || !novoCompromisso.descricao || !novoCompromisso.assessor) return;
    addCompromisso(novoCompromisso, {
      onSuccess: () => {
        setNovoCompromisso({ data: '', horario: '', local: '', descricao: '', tipo: 'reuniao', assessor: '' });
        setIsDialogOpen(false);
      }
    });
  };

  const datasOrdenadas = Object.keys(compromissosAgrupados).sort();
  const hojeISO = new Date().toISOString().split('T')[0];
  const compromissosHoje = compromissosAgrupados[hojeISO] || [];

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-32 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (isError) {
    return <Card className="bg-red-50 border-red-200 text-red-800"><CardContent className="text-center py-8 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /><p>Ocorreu um erro ao buscar a agenda.</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Agenda de Compromissos</h1>
          <p className="text-muted-foreground">Gerencie seus compromissos e eventos políticos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="bg-political-blue hover:bg-political-navy"><Calendar className="mr-2 h-4 w-4" />Novo Compromisso</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Agendar Novo Compromisso</DialogTitle><DialogDescription>Cadastre um novo compromisso na agenda</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos existentes... */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="data">Data *</Label><Input id="data" type="date" value={novoCompromisso.data} onChange={(e) => setNovoCompromisso({...novoCompromisso, data: e.target.value})} required /></div>
                <div className="space-y-2"><Label htmlFor="horario">Horário *</Label><Input id="horario" type="time" value={novoCompromisso.horario} onChange={(e) => setNovoCompromisso({...novoCompromisso, horario: e.target.value})} required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="local">Local *</Label><Input id="local" value={novoCompromisso.local} onChange={(e) => setNovoCompromisso({...novoCompromisso, local: e.target.value})} placeholder="Digite o local do compromisso" required /></div>
              
              {/* NOVO CAMPO DE SELEÇÃO PARA O ASSESSOR */}
              <div className="space-y-2">
                <Label htmlFor="assessor">Assessor Responsável *</Label>
                <Select value={novoCompromisso.assessor} onValueChange={(value) => setNovoCompromisso({...novoCompromisso, assessor: value})} required>
                  <SelectTrigger><SelectValue placeholder="Selecione um assessor" /></SelectTrigger>
                  <SelectContent>
                    {assessores.map(assessor => (
                      <SelectItem key={assessor.id} value={assessor.nome}>{assessor.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo do Compromisso *</Label>
                <select id="tipo" value={novoCompromisso.tipo} onChange={(e) => setNovoCompromisso({...novoCompromisso, tipo: e.target.value as any})} className="w-full p-2 border border-gray-300 rounded-md" required>
                  <option value="reuniao">Reunião</option><option value="evento">Evento</option><option value="visita">Visita</option><option value="sessao">Sessão</option>
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="descricao">Descrição *</Label><Textarea id="descricao" value={novoCompromisso.descricao} onChange={(e) => setNovoCompromisso({...novoCompromisso, descricao: e.target.value})} placeholder="Descreva o compromisso" rows={3} required /></div>
              <div className="flex gap-2"><Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy" disabled={isAdding}>{isAdding ? 'A Agendar...' : 'Agendar'}</Button><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Exibição dos compromissos (cards) */}
      <Card className="border-l-4 border-l-political-gold">
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-political-gold" />Compromissos de Hoje ({compromissosHoje.length})</CardTitle><CardDescription>{formatarDataCompleta(hojeISO)}</CardDescription></CardHeader>
        <CardContent>
          {compromissosHoje.length > 0 ? (
            <div className="space-y-3">
              {compromissosHoje.map((compromisso) => (
                <div key={compromisso.id} className="flex items-start gap-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="text-center min-w-[60px]"><div className="text-lg font-bold text-political-navy">{compromisso.horario}</div></div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1"><h4 className="font-semibold text-political-navy">{compromisso.descricao}</h4><Badge className={`${getCorTipo(compromisso.tipo)} text-white`}>{getNomeTipo(compromisso.tipo)}</Badge></div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">📍 {compromisso.local}</p>
                        {/* EXIBIR O NOME DO ASSESSOR */}
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><UserCheck className="h-4 w-4" />Responsável: {compromisso.assessor}</p>
                    </div>
                </div>
              ))}
            </div>
          ) : (<p className="text-center text-muted-foreground py-4">Nenhum compromisso agendado para hoje.</p>)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Agenda Completa</CardTitle><CardDescription>Todos os compromissos agendados</CardDescription></CardHeader>
        <CardContent>
          {datasOrdenadas.length > 0 ? (
          <div className="space-y-6">
            {datasOrdenadas.map((data) => (
              <div key={data}>
                <h3 className="text-lg font-semibold text-political-navy mb-3 border-b pb-2">{formatarDataCompleta(data)}</h3>
                <div className="space-y-2">
                  {compromissosAgrupados[data].map((compromisso) => (
                    <div key={compromisso.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="text-center min-w-[60px]"><div className="font-medium text-political-navy">{compromisso.horario}</div></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1"><h4 className="font-medium text-political-navy">{compromisso.descricao}</h4><Badge className={`${getCorTipo(compromisso.tipo)} text-white`}>{getNomeTipo(compromisso.tipo)}</Badge></div>
                        <p className="text-sm text-muted-foreground">📍 {compromisso.local}</p>
                        {/* EXIBIR O NOME DO ASSESSOR */}
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><UserCheck className="h-4 w-4" />Responsável: {compromisso.assessor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          ) : (<div className="text-center py-8"><p className="text-muted-foreground">Nenhum compromisso agendado.</p></div>) }
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;
