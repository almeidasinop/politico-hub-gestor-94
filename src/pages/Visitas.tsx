import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, UserPlus, AlertCircle, PlusCircle, List, Tag } from 'lucide-react';
import { useVisitas, type NovaVisitaPayload } from '@/hooks/use-visitas';
import { type NovoContato } from '@/hooks/use-contatos';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge'; // CORREÇÃO: Importação do Badge adicionada

const Visitas = () => {
  const {
    visitasAgrupadas,
    contatos,
    tiposDeVisitaUnicos,
    isLoading,
    isError,
    addVisita,
    isAdding,
    formatarDataCompleta
  } = useVisitas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [visitaData, setVisitaData] = useState({
    data: '',
    horario: '',
    localizacao: '',
    observacao: '',
    tipoVisita: '', 
  });

  const [contactAction, setContactAction] = useState<'select' | 'create'>('select');
  const [selectedContatoId, setSelectedContatoId] = useState('');
  const [novoContatoData, setNovoContatoData] = useState<NovoContato>({
    nome: '', telefone: '', aniversario: '', cargo: '', observacoes: ''
  });

  const resetForm = () => {
    setVisitaData({ data: '', horario: '', localizacao: '', observacao: '', tipoVisita: '' });
    setContactAction('select');
    setSelectedContatoId('');
    setNovoContatoData({ nome: '', telefone: '', aniversario: '', cargo: '', observacoes: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitaData.data || !visitaData.horario || !visitaData.localizacao) return;

    const payload: NovaVisitaPayload = { visitaData };

    if (contactAction === 'select' && selectedContatoId) {
      payload.contatoId = selectedContatoId;
    } else if (contactAction === 'create' && novoContatoData.nome) {
      payload.novoContatoData = novoContatoData;
    }

    addVisita(payload, {
      onSuccess: () => {
        resetForm();
        setIsDialogOpen(false);
      }
    });
  };

  const datasOrdenadas = Object.keys(visitasAgrupadas).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return <Card className="bg-red-50 border-red-200 text-red-800"><CardContent className="text-center py-8 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /><p>Ocorreu um erro ao buscar as visitas.</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Registro de Visitas</h1>
          <p className="text-muted-foreground">Acompanhe suas atividades no território</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="bg-political-blue hover:bg-political-navy"><MapPin className="mr-2 h-4 w-4" />Nova Visita</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nova Visita</DialogTitle>
              <DialogDescription>Preencha as informações da visita e associe a um contato.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Detalhes da Visita</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input id="data" type="date" value={visitaData.data} onChange={(e) => setVisitaData({ ...visitaData, data: e.target.value })} required />
                  <Input id="horario" type="time" value={visitaData.horario} onChange={(e) => setVisitaData({ ...visitaData, horario: e.target.value })} required />
                </div>
                <Input id="localizacao" value={visitaData.localizacao} onChange={(e) => setVisitaData({ ...visitaData, localizacao: e.target.value })} placeholder="Localização (Endereço, Bairro...)" required />
                <div className="space-y-2">
                  <Label htmlFor="tipoVisita">Tipo da Visita</Label>
                  <Input id="tipoVisita" list="tipos-visita-data" value={visitaData.tipoVisita} onChange={(e) => setVisitaData({ ...visitaData, tipoVisita: e.target.value })} placeholder="Ex: Entrega de ofício, Reunião..." />
                  <datalist id="tipos-visita-data">
                    {tiposDeVisitaUnicos.map(tipo => <option key={tipo} value={tipo} />)}
                  </datalist>
                </div>
                <Textarea id="observacao" value={visitaData.observacao} onChange={(e) => setVisitaData({ ...visitaData, observacao: e.target.value })} placeholder="Observações sobre a visita..." rows={3} />
              </div>

              <Separator />
              
              <div className="space-y-3">
                  <Label>Contato Associado</Label>
                  <div className="flex gap-2">
                      <Button type="button" variant={contactAction === 'select' ? 'default' : 'outline'} className="flex-1" onClick={() => setContactAction('select')}><List className="mr-2 h-4 w-4" /> Selecionar</Button>
                      <Button type="button" variant={contactAction === 'create' ? 'default' : 'outline'} className="flex-1" onClick={() => setContactAction('create')}><PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Novo</Button>
                  </div>

                  {contactAction === 'select' && (
                      <Select value={selectedContatoId} onValueChange={setSelectedContatoId}><SelectTrigger><SelectValue placeholder="Selecione um contato existente" /></SelectTrigger><SelectContent>{Array.isArray(contatos) && contatos.map(contato => (<SelectItem key={contato.id} value={contato.id}>{contato.nome}</SelectItem>))}</SelectContent></Select>
                  )}

                  {contactAction === 'create' && (
                      <div className="space-y-2 border p-3 rounded-md bg-muted/50">
                          <Input placeholder="Nome Completo *" value={novoContatoData.nome} onChange={(e) => setNovoContatoData({...novoContatoData, nome: e.target.value})} required={contactAction === 'create'} />
                          <Input placeholder="Telefone" value={novoContatoData.telefone} onChange={(e) => setNovoContatoData({...novoContatoData, telefone: e.target.value})} />
                          <div className="flex items-center gap-2"><Label htmlFor="novo-aniversario" className="text-xs shrink-0">Nascimento:</Label><Input id="novo-aniversario" className="text-xs" type="date" value={novoContatoData.aniversario} onChange={(e) => setNovoContatoData({...novoContatoData, aniversario: e.target.value})} /></div>
                      </div>
                  )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy" disabled={isAdding}>{isAdding ? 'Registrando...' : 'Registrar Visita'}</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {datasOrdenadas.length === 0 && !isLoading && ( <Card><CardContent className="text-center py-8"><p className="text-muted-foreground">Nenhuma visita registrada. Adicione sua primeira visita!</p></CardContent></Card> )}

      {datasOrdenadas.map((data) => (
        <div key={data} className="space-y-4">
          <h3 className="text-lg font-semibold text-political-navy border-b pb-2">{formatarDataCompleta(data)}</h3>
          <div className="space-y-4">
            {visitasAgrupadas[data].map((visita) => (
              <Card key={visita.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                      <div className='flex items-center gap-4'>
                        <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground" /><span>{visita.horario}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-muted-foreground" /><span>{visita.localizacao}</span></div>
                      </div>
                      {visita.tipoVisita && <Badge variant="secondary">{visita.tipoVisita}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visita.contatoNome && (<div className="flex items-center gap-2 text-sm text-political-blue font-medium mb-3 p-2 bg-blue-50 rounded-md"><UserPlus className="h-4 w-4" /><span>Contato: {visita.contatoNome}</span></div>)}
                  <p className="text-muted-foreground">{visita.observacao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Visitas;
