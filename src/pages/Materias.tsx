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
import { FileText, Link, AlertCircle } from 'lucide-react';
import { useMaterias, type NovaMateria, type MateriaStatus } from '@/hooks/use-materias';

const getCorStatus = (status: string) => {
  const cores: { [key: string]: string } = { 
    'Aguardando': 'bg-yellow-500', 
    'Aprovado': 'bg-green-500', 
    'Rejeitado': 'bg-red-500',
    'Atendida': 'bg-blue-600' // Cor para o novo status
  };
  return cores[status] || 'bg-gray-500';
};
const formatarData = (data: string) => new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

const Materias = () => {
  const {
    materiasFiltradas, isLoading, isError, addMateria, isAdding,
    filtroStatus, setFiltroStatus, searchTerm, setSearchTerm, estatisticas
  } = useMaterias();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novaMateria, setNovaMateria] = useState<Omit<NovaMateria, 'dataSubmissao'>>({
    titulo: '', descricao: '', linkArquivo: '', status: 'Aguardando', observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMateria.titulo || !novaMateria.descricao) return;
    
    addMateria({
      ...novaMateria,
      dataSubmissao: new Date().toISOString().split('T')[0]
    }, {
      onSuccess: () => {
        setNovaMateria({ titulo: '', descricao: '', linkArquivo: '', status: 'Aguardando', observacoes: '' });
        setIsDialogOpen(false);
      }
    });
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><div className="grid grid-cols-1 md:grid-cols-5 gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div><Skeleton className="h-48 w-full" /></div>;
  }

  if (isError) {
    return <Card className="bg-red-50 border-red-200 text-red-800"><CardContent className="text-center py-8 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /><p>Ocorreu um erro ao buscar as matérias.</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-political-navy">Matérias Legislativas</h1><p className="text-muted-foreground">Gerencie projetos de lei e documentos legislativos</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="bg-political-blue hover:bg-political-navy"><FileText className="mr-2 h-4 w-4" />Nova Matéria</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Cadastrar Nova Matéria</DialogTitle><DialogDescription>Registe uma nova matéria legislativa no sistema</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="titulo">Título da Matéria *</Label><Input id="titulo" value={novaMateria.titulo} onChange={(e) => setNovaMateria({...novaMateria, titulo: e.target.value})} placeholder="Ex: Projeto de Lei nº 123/2025" required /></div>
              <div className="space-y-2"><Label htmlFor="descricao">Descrição Resumida *</Label><Textarea id="descricao" value={novaMateria.descricao} onChange={(e) => setNovaMateria({...novaMateria, descricao: e.target.value})} placeholder="Descreva brevemente o objetivo da matéria" rows={3} required /></div>
              <div className="space-y-2"><Label htmlFor="linkArquivo">Link do Arquivo (Google Drive, etc.)</Label><Input id="linkArquivo" type="url" value={novaMateria.linkArquivo} onChange={(e) => setNovaMateria({...novaMateria, linkArquivo: e.target.value})} placeholder="https://drive.google.com/..." /><p className="text-xs text-muted-foreground">Certifique-se de que o link está partilhado publicamente.</p></div>
              <div className="space-y-2">
                <Label htmlFor="status">Status da Matéria</Label>
                <Select value={novaMateria.status} onValueChange={(value) => setNovaMateria({...novaMateria, status: value as MateriaStatus})}>
                    <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Aguardando">Aguardando</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                        <SelectItem value="Atendida">Atendida</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="observacoes">Observações</Label><Textarea id="observacoes" value={novaMateria.observacoes} onChange={(e) => setNovaMateria({...novaMateria, observacoes: e.target.value})} placeholder="Anotações, comentários ou justificativas" rows={4} /></div>
              <div className="flex gap-2"><Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy" disabled={isAdding}>{isAdding ? 'A Cadastrar...' : 'Cadastrar Matéria'}</Button><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de estatísticas atualizados para 5 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-gray-400"><CardHeader><CardTitle className="text-lg">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{estatisticas.total}</div></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardHeader><CardTitle className="text-lg">Aguardando</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{estatisticas.aguardando}</div></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardHeader><CardTitle className="text-lg">Aprovadas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{estatisticas.aprovadas}</div></CardContent></Card>
        <Card className="border-l-4 border-l-red-500"><CardHeader><CardTitle className="text-lg">Rejeitadas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{estatisticas.rejeitadas}</div></CardContent></Card>
        <Card className="border-l-4 border-l-blue-600"><CardHeader><CardTitle className="text-lg">Atendidas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{estatisticas.atendidas}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Filtrar Matérias</CardTitle></CardHeader>
        <CardContent>
            <div className="flex gap-4">
                <Input placeholder="Pesquisar por título ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="Aguardando">Aguardando</SelectItem>
                        <SelectItem value="Aprovado">Aprovado</SelectItem>
                        <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                        <SelectItem value="Atendida">Atendida</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {materiasFiltradas.map((materia) => (
          <Card key={materia.id} className="hover:shadow-lg transition-shadow">
            <CardHeader><div className="flex items-start justify-between"><div className="flex-1"><CardTitle className="text-lg text-political-navy mb-2">{materia.titulo}</CardTitle><CardDescription className="text-base">{materia.descricao}</CardDescription></div><Badge className={`${getCorStatus(materia.status)} text-white ml-4`}>{materia.status}</Badge></div></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {materia.linkArquivo && (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded"><Link className="h-4 w-4 text-blue-600" /><a href={materia.linkArquivo} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-700 hover:underline truncate">{materia.linkArquivo}</a></div>)}
                {materia.observacoes && (<div className="p-3 bg-blue-50 rounded-lg border border-blue-200"><h4 className="font-medium text-political-navy mb-1">Observações:</h4><p className="text-sm text-gray-700">{materia.observacoes}</p></div>)}
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3"><span>Data de submissão: {formatarData(materia.dataSubmissao)}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Materias;
