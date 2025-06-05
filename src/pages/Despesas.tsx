
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

interface Despesa {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
}

const Despesas = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([
    {
      id: 1,
      data: '2024-12-01',
      descricao: 'Combustível para viagem oficial',
      valor: 120.50,
      categoria: 'Transporte'
    },
    {
      id: 2,
      data: '2024-12-02',
      descricao: 'Material de escritório',
      valor: 85.30,
      categoria: 'Material'
    },
    {
      id: 3,
      data: '2024-12-03',
      descricao: 'Almoço de trabalho com assessores',
      valor: 180.00,
      categoria: 'Alimentação'
    },
    {
      id: 4,
      data: '2024-12-04',
      descricao: 'Passagem aérea para evento',
      valor: 450.00,
      categoria: 'Viagem'
    },
    {
      id: 5,
      data: '2024-12-05',
      descricao: 'Hospedagem em hotel',
      valor: 220.00,
      categoria: 'Viagem'
    }
  ]);

  const [novaDespesa, setNovaDespesa] = useState({
    data: '',
    descricao: '',
    valor: '',
    categoria: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const { toast } = useToast();

  const categorias = ['Transporte', 'Material', 'Alimentação', 'Viagem', 'Comunicação', 'Consultoria'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaDespesa.data || !novaDespesa.descricao || !novaDespesa.valor || !novaDespesa.categoria) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const novoId = Math.max(...despesas.map(d => d.id), 0) + 1;
    const despesa: Despesa = {
      id: novoId,
      data: novaDespesa.data,
      descricao: novaDespesa.descricao,
      valor: parseFloat(novaDespesa.valor),
      categoria: novaDespesa.categoria
    };

    setDespesas([...despesas, despesa]);
    setNovaDespesa({
      data: '',
      descricao: '',
      valor: '',
      categoria: ''
    });
    setIsDialogOpen(false);

    toast({
      title: "Sucesso!",
      description: "Despesa lançada com sucesso.",
    });
  };

  const despesasFiltradas = filtroCategoria === 'todas' 
    ? despesas 
    : despesas.filter(d => d.categoria === filtroCategoria);

  const totalGeral = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const totalMes = despesas
    .filter(d => d.data.startsWith('2024-12'))
    .reduce((sum, despesa) => sum + despesa.valor, 0);

  const despesasPorCategoria = categorias.map(categoria => ({
    categoria,
    total: despesas
      .filter(d => d.categoria === categoria)
      .reduce((sum, despesa) => sum + despesa.valor, 0)
  })).filter(item => item.total > 0);

  const getCorCategoria = (categoria: string) => {
    const cores: { [key: string]: string } = {
      'Transporte': 'bg-blue-500',
      'Material': 'bg-green-500',
      'Alimentação': 'bg-orange-500',
      'Viagem': 'bg-purple-500',
      'Comunicação': 'bg-pink-500',
      'Consultoria': 'bg-indigo-500'
    };
    return cores[categoria] || 'bg-gray-500';
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Gestão de Despesas</h1>
          <p className="text-muted-foreground">Controle e monitore suas despesas políticas</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-political-blue hover:bg-political-navy">
              <FileText className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Lançar Nova Despesa</DialogTitle>
              <DialogDescription>
                Registre uma nova despesa no sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={novaDespesa.data}
                  onChange={(e) => setNovaDespesa({...novaDespesa, data: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={novaDespesa.descricao}
                  onChange={(e) => setNovaDespesa({...novaDespesa, descricao: e.target.value})}
                  placeholder="Descreva a despesa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={novaDespesa.valor}
                  onChange={(e) => setNovaDespesa({...novaDespesa, valor: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={novaDespesa.categoria} onValueChange={(value) => setNovaDespesa({...novaDespesa, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy">
                  Lançar Despesa
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

      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg">Total do Mês</CardTitle>
            <CardDescription>Dezembro 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-political-blue">
          <CardHeader>
            <CardTitle className="text-lg">Total Geral</CardTitle>
            <CardDescription>Todas as despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-political-blue">
              R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-political-gold">
          <CardHeader>
            <CardTitle className="text-lg">Despesas</CardTitle>
            <CardDescription>Total de registros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-political-gold">
              {despesas.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtroCategoria !== 'todas' && (
              <Button variant="outline" onClick={() => setFiltroCategoria('todas')}>
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Despesas por categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {despesasPorCategoria.map((item) => (
              <div 
                key={item.categoria} 
                className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCorCategoria(item.categoria)}`}></div>
                  <span className="font-medium">{item.categoria}</span>
                </div>
                <span className="font-bold text-political-navy">
                  R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Despesas</CardTitle>
          <CardDescription>
            {filtroCategoria !== 'todas' ? `Categoria: ${filtroCategoria}` : 'Todas as despesas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {despesasFiltradas.map((despesa) => (
              <div 
                key={despesa.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-political-navy">{despesa.descricao}</h4>
                    <Badge className={`${getCorCategoria(despesa.categoria)} text-white`}>
                      {despesa.categoria}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatarData(despesa.data)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-political-navy">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {despesasFiltradas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma despesa encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Despesas;
