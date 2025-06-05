
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
import { FileText, File } from 'lucide-react';

interface Materia {
  id: number;
  titulo: string;
  descricao: string;
  arquivo: string | null;
  status: 'Aguardando' | 'Aprovado' | 'Rejeitado';
  observacoes: string;
  dataSubmissao: string;
}

const Materias = () => {
  const [materias, setMaterias] = useState<Materia[]>([
    {
      id: 1,
      titulo: 'Projeto de Lei nº 123/2025',
      descricao: 'Altera dispositivos da Lei nº XYZ para regulamentar o transporte público municipal.',
      arquivo: 'PL_123_2025.pdf',
      status: 'Aguardando',
      observacoes: 'Projeto importante para melhorar o transporte público da cidade. Aguardando análise da comissão.',
      dataSubmissao: '2024-11-15'
    },
    {
      id: 2,
      titulo: 'Projeto de Lei nº 124/2025',
      descricao: 'Institui programa de apoio às pequenas empresas locais.',
      arquivo: 'PL_124_2025.pdf',
      status: 'Aprovado',
      observacoes: 'Projeto aprovado por unanimidade. Implementação prevista para janeiro de 2025.',
      dataSubmissao: '2024-10-20'
    },
    {
      id: 3,
      titulo: 'Projeto de Lei nº 125/2025',
      descricao: 'Cria fundo municipal para preservação ambiental.',
      arquivo: 'PL_125_2025.pdf',
      status: 'Rejeitado',
      observacoes: 'Rejeitado por questões orçamentárias. Necessário reformular proposta.',
      dataSubmissao: '2024-09-10'
    }
  ]);

  const [novaMateria, setNovaMateria] = useState({
    titulo: '',
    descricao: '',
    arquivo: null as File | null,
    status: 'Aguardando' as const,
    observacoes: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaMateria.titulo || !novaMateria.descricao) {
      toast({
        title: "Erro",
        description: "Por favor, preencha pelo menos o título e descrição.",
        variant: "destructive",
      });
      return;
    }

    const novoId = Math.max(...materias.map(m => m.id), 0) + 1;
    const materia: Materia = {
      id: novoId,
      titulo: novaMateria.titulo,
      descricao: novaMateria.descricao,
      arquivo: novaMateria.arquivo ? novaMateria.arquivo.name : null,
      status: novaMateria.status,
      observacoes: novaMateria.observacoes,
      dataSubmissao: new Date().toISOString().split('T')[0]
    };

    setMaterias([...materias, materia]);
    setNovaMateria({
      titulo: '',
      descricao: '',
      arquivo: null,
      status: 'Aguardando',
      observacoes: ''
    });
    setIsDialogOpen(false);

    toast({
      title: "Sucesso!",
      description: "Matéria cadastrada com sucesso.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setNovaMateria({...novaMateria, arquivo: file});
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos PDF.",
        variant: "destructive",
      });
    }
  };

  const materiasFiltradas = materias.filter(materia => {
    const matchesStatus = filtroStatus === 'todos' || materia.status === filtroStatus;
    const matchesSearch = materia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         materia.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getCorStatus = (status: string) => {
    const cores: { [key: string]: string } = {
      'Aguardando': 'bg-yellow-500',
      'Aprovado': 'bg-green-500',
      'Rejeitado': 'bg-red-500'
    };
    return cores[status] || 'bg-gray-500';
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const estatisticas = {
    total: materias.length,
    aguardando: materias.filter(m => m.status === 'Aguardando').length,
    aprovadas: materias.filter(m => m.status === 'Aprovado').length,
    rejeitadas: materias.filter(m => m.status === 'Rejeitado').length
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Matérias Legislativas</h1>
          <p className="text-muted-foreground">Gerencie projetos de lei e documentos legislativos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-political-blue hover:bg-political-navy">
              <FileText className="mr-2 h-4 w-4" />
              Nova Matéria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Matéria</DialogTitle>
              <DialogDescription>
                Registre uma nova matéria legislativa no sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Matéria *</Label>
                <Input
                  id="titulo"
                  value={novaMateria.titulo}
                  onChange={(e) => setNovaMateria({...novaMateria, titulo: e.target.value})}
                  placeholder="Ex: Projeto de Lei nº 123/2025"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição Resumida *</Label>
                <Textarea
                  id="descricao"
                  value={novaMateria.descricao}
                  onChange={(e) => setNovaMateria({...novaMateria, descricao: e.target.value})}
                  placeholder="Descreva brevemente o objetivo da matéria"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo PDF</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Faça upload do documento oficial em PDF
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status da Matéria</Label>
                <Select value={novaMateria.status} onValueChange={(value) => setNovaMateria({...novaMateria, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aguardando">Aguardando</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={novaMateria.observacoes}
                  onChange={(e) => setNovaMateria({...novaMateria, observacoes: e.target.value})}
                  placeholder="Anotações, comentários ou justificativas (até 5.000 caracteres)"
                  rows={4}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">
                  {novaMateria.observacoes.length}/5000 caracteres
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy">
                  Cadastrar Matéria
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-political-blue">
          <CardHeader>
            <CardTitle className="text-lg">Total</CardTitle>
            <CardDescription>Matérias cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-political-blue">{estatisticas.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-lg">Aguardando</CardTitle>
            <CardDescription>Em tramitação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.aguardando}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg">Aprovadas</CardTitle>
            <CardDescription>Projetos aprovados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estatisticas.aprovadas}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg">Rejeitadas</CardTitle>
            <CardDescription>Projetos rejeitados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estatisticas.rejeitadas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar Matérias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Pesquisar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Aguardando">Aguardando</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            {(filtroStatus !== 'todos' || searchTerm) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltroStatus('todos');
                  setSearchTerm('');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de matérias */}
      <div className="space-y-4">
        {materiasFiltradas.map((materia) => (
          <Card key={materia.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-political-navy mb-2">
                    {materia.titulo}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {materia.descricao}
                  </CardDescription>
                </div>
                <Badge className={`${getCorStatus(materia.status)} text-white ml-4`}>
                  {materia.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {materia.arquivo && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <File className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">{materia.arquivo}</span>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Visualizar PDF
                    </Button>
                  </div>
                )}

                {materia.observacoes && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-political-navy mb-1">Observações:</h4>
                    <p className="text-sm text-gray-700">{materia.observacoes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                  <span>Data de submissão: {formatarData(materia.dataSubmissao)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {materiasFiltradas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {filtroStatus !== 'todos' || searchTerm 
                ? 'Nenhuma matéria encontrada com os filtros aplicados.' 
                : 'Nenhuma matéria cadastrada.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Materias;
