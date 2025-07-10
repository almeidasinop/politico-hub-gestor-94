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
import { FileText, AlertCircle } from 'lucide-react';
import { useDespesas, categoriasDespesa, type NovaDespesa } from '@/hooks/use-despesas';

const getCorCategoria = (categoria: string) => {
    const cores: { [key: string]: string } = {
      'Transporte': 'bg-blue-500', 'Material': 'bg-green-500', 'Alimentação': 'bg-orange-500',
      'Viagem': 'bg-purple-500', 'Comunicação': 'bg-pink-500', 'Consultoria': 'bg-indigo-500', 'Outros': 'bg-gray-500'
    };
    return cores[categoria] || 'bg-gray-400';
};

const Despesas = () => {
  const {
    despesasFiltradas, isLoading, isError, addDespesa, isAdding,
    filtroCategoria, setFiltroCategoria, estatisticas, formatarData
  } = useDespesas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novaDespesa, setNovaDespesa] = useState<Omit<NovaDespesa, 'valor'> & { valor: string }>({
    data: '', descricao: '', valor: '', categoria: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDespesa.data || !novaDespesa.descricao || !novaDespesa.valor || !novaDespesa.categoria) return;
    addDespesa({ ...novaDespesa, valor: parseFloat(novaDespesa.valor) }, {
      onSuccess: () => {
        setNovaDespesa({ data: '', descricao: '', valor: '', categoria: '' });
        setIsDialogOpen(false);
      }
    });
  };
  
  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-6 w-1/2" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div><Skeleton className="h-48 w-full" /></div>;
  }

  if (isError) {
    return <Card className="bg-red-50 border-red-200 text-red-800"><CardContent className="text-center py-8 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /><p>Ocorreu um erro ao buscar as despesas.</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Gestão de Despesas</h1>
          <p className="text-muted-foreground">Controle e monitore as suas despesas políticas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button className="bg-political-blue hover:bg-political-navy"><FileText className="mr-2 h-4 w-4" />Nova Despesa</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Lançar Nova Despesa</DialogTitle><DialogDescription>Registe uma nova despesa no sistema</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="data">Data *</Label><Input id="data" type="date" value={novaDespesa.data} onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="descricao">Descrição *</Label><Textarea id="descricao" value={novaDespesa.descricao} onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})} placeholder="Descreva a despesa" required /></div>
              <div className="space-y-2"><Label htmlFor="valor">Valor (R$) *</Label><Input id="valor" type="number" step="0.01" value={novaDespesa.valor} onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})} placeholder="0,00" required /></div>
              <div className="space-y-2"><Label htmlFor="categoria">Categoria *</Label><Select value={novaDespesa.categoria} onValueChange={(value) => setNovaDespesa({...novaDespesa, categoria: value})}><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger><SelectContent>{categoriasDespesa.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select></div>
              <div className="flex gap-2"><Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy" disabled={isAdding}>{isAdding ? 'A Lançar...' : 'Lançar Despesa'}</Button><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancelar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500"><CardHeader><CardTitle className="text-lg">Total do Mês</CardTitle><CardDescription>Dezembro 2024</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">R$ {estatisticas.totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent></Card>
        <Card className="border-l-4 border-l-political-blue"><CardHeader><CardTitle className="text-lg">Total Geral</CardTitle><CardDescription>Todas as despesas</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-political-blue">R$ {estatisticas.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></CardContent></Card>
        <Card className="border-l-4 border-l-political-gold"><CardHeader><CardTitle className="text-lg">Despesas</CardTitle><CardDescription>Total de registos</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold text-political-gold">{estatisticas.totalRegistos}</div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Filtrar Despesas</CardTitle></CardHeader><CardContent><div className="flex gap-4"><Select value={filtroCategoria} onValueChange={setFiltroCategoria}><SelectTrigger className="w-48"><SelectValue placeholder="Todas as categorias" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as categorias</SelectItem>{categoriasDespesa.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select>{filtroCategoria !== 'todas' && (<Button variant="outline" onClick={() => setFiltroCategoria('todas')}>Limpar Filtro</Button>)}</div></CardContent></Card>

      <Card><CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{estatisticas.despesasPorCategoria.map((item) => (<div key={item.categoria} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${getCorCategoria(item.categoria)}`}></div><span className="font-medium">{item.categoria}</span></div><span className="font-bold text-political-navy">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>))}</div></CardContent></Card>
      
      <Card><CardHeader><CardTitle>Histórico de Despesas</CardTitle><CardDescription>{filtroCategoria !== 'todas' ? `Categoria: ${filtroCategoria}` : 'Todas as despesas'}</CardDescription></CardHeader><CardContent>{despesasFiltradas.length > 0 ? (<div className="space-y-3">{despesasFiltradas.map((despesa) => (<div key={despesa.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h4 className="font-medium text-political-navy">{despesa.descricao}</h4><Badge className={`${getCorCategoria(despesa.categoria)} text-white`}>{despesa.categoria}</Badge></div><p className="text-sm text-muted-foreground">{formatarData(despesa.data)}</p></div><div className="text-right"><div className="text-lg font-bold text-political-navy">R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div></div>))}</div>) : (<div className="text-center py-8"><p className="text-muted-foreground">Nenhuma despesa encontrada.</p></div>)}</CardContent></Card>
    </div>
  );
};

export default Despesas;
