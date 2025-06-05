
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
import { User, Calendar } from 'lucide-react';

interface Contato {
  id: number;
  nome: string;
  telefone: string;
  aniversario: string;
  cargo: string;
  observacoes: string;
}

const Contatos = () => {
  const [contatos, setContatos] = useState<Contato[]>([
    {
      id: 1,
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      aniversario: '1985-03-15',
      cargo: 'Assessor',
      observacoes: 'Assessor de comunicação, muito responsável'
    },
    {
      id: 2,
      nome: 'Maria Santos',
      telefone: '(11) 88888-8888',
      aniversario: '1990-12-06',
      cargo: 'Jornalista',
      observacoes: 'Jornalista do jornal local, boa parceria'
    },
    {
      id: 3,
      nome: 'Carlos Oliveira',
      telefone: '(11) 77777-7777',
      aniversario: '1980-07-22',
      cargo: 'Eleitor',
      observacoes: 'Eleitor influente no bairro Centro'
    }
  ]);

  const [novoContato, setNovoContato] = useState({
    nome: '',
    telefone: '',
    aniversario: '',
    cargo: '',
    observacoes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoContato.nome || !novoContato.telefone || !novoContato.aniversario || !novoContato.cargo) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const novoId = Math.max(...contatos.map(c => c.id), 0) + 1;
    const contato: Contato = {
      id: novoId,
      ...novoContato
    };

    setContatos([...contatos, contato]);
    setNovoContato({
      nome: '',
      telefone: '',
      aniversario: '',
      cargo: '',
      observacoes: ''
    });
    setIsDialogOpen(false);

    toast({
      title: "Sucesso!",
      description: "Contato adicionado com sucesso.",
    });
  };

  const filteredContatos = contatos.filter(contato =>
    contato.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contato.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getCorCargo = (cargo: string) => {
    const cores: { [key: string]: string } = {
      'Assessor': 'bg-political-blue',
      'Jornalista': 'bg-political-gold',
      'Eleitor': 'bg-green-500',
      'Empresário': 'bg-purple-500',
      'Funcionário Público': 'bg-gray-500'
    };
    return cores[cargo] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-political-navy">Gestão de Contatos</h1>
          <p className="text-muted-foreground">Gerencie seus contatos políticos e relacionamentos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-political-blue hover:bg-political-navy">
              <User className="mr-2 h-4 w-4" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Contato</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo contato
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={novoContato.nome}
                  onChange={(e) => setNovoContato({...novoContato, nome: e.target.value})}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={novoContato.telefone}
                  onChange={(e) => setNovoContato({...novoContato, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aniversario">Data de Aniversário *</Label>
                <Input
                  id="aniversario"
                  type="date"
                  value={novoContato.aniversario}
                  onChange={(e) => setNovoContato({...novoContato, aniversario: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo ou Relação *</Label>
                <Select value={novoContato.cargo} onValueChange={(value) => setNovoContato({...novoContato, cargo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assessor">Assessor</SelectItem>
                    <SelectItem value="Jornalista">Jornalista</SelectItem>
                    <SelectItem value="Eleitor">Eleitor</SelectItem>
                    <SelectItem value="Empresário">Empresário</SelectItem>
                    <SelectItem value="Funcionário Público">Funcionário Público</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={novoContato.observacoes}
                  onChange={(e) => setNovoContato({...novoContato, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre o contato"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy">
                  Salvar
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

      {/* Barra de pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Pesquisar por nome ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Lista de contatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContatos.map((contato) => (
          <Card key={contato.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{contato.nome}</span>
                <Badge className={`${getCorCargo(contato.cargo)} text-white`}>
                  {contato.cargo}
                </Badge>
              </CardTitle>
              <CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📞</span>
                    {contato.telefone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatarData(contato.aniversario)}
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            {contato.observacoes && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <strong>Observações:</strong> {contato.observacoes}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredContatos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum contato encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Contatos;
