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
import { User, Calendar, AlertCircle } from 'lucide-react';
import { useContatos, type NovoContato } from '@/hooks/use-contatos';

const Contatos = () => {
  const { 
    contatos, 
    isLoading, 
    isError, 
    addContato, 
    isAdding,
    searchTerm,
    setSearchTerm,
    formatarData,
    getCorCargo 
  } = useContatos();

  const [novoContato, setNovoContato] = useState<NovoContato>({
    nome: '', telefone: '', aniversario: '', cargo: '', observacoes: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoContato.nome || !novoContato.telefone || !novoContato.aniversario || !novoContato.cargo) {
      return;
    }
    addContato(novoContato, {
      onSuccess: () => {
        setNovoContato({ nome: '', telefone: '', aniversario: '', cargo: '', observacoes: '' });
        setIsDialogOpen(false);
      }
    });
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
                <Input id="nome" value={novoContato.nome} onChange={(e) => setNovoContato({...novoContato, nome: e.target.value})} placeholder="Digite o nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" value={novoContato.telefone} onChange={(e) => setNovoContato({...novoContato, telefone: e.target.value})} placeholder="(11) 99999-9999" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aniversario">Data de Aniversário *</Label>
                <Input id="aniversario" type="date" value={novoContato.aniversario} onChange={(e) => setNovoContato({...novoContato, aniversario: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo ou Relação *</Label>
                <Select value={novoContato.cargo} onValueChange={(value) => setNovoContato({...novoContato, cargo: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
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
                <Textarea id="observacoes" value={novoContato.observacoes} onChange={(e) => setNovoContato({...novoContato, observacoes: e.target.value})} placeholder="Informações adicionais sobre o contato" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-political-blue hover:bg-political-navy" disabled={isAdding}>
                  {isAdding ? 'A Guardar...' : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Pesquisar Contatos</CardTitle></CardHeader>
        <CardContent>
          <Input placeholder="Pesquisar por nome ou cargo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      )}

      {isError && (
         <Card className="bg-red-50 border-red-200 text-red-800">
           <CardContent className="text-center py-8 flex items-center justify-center gap-2">
             <AlertCircle className="h-5 w-5" />
             <p>Ocorreu um erro ao buscar os contatos.</p>
           </CardContent>
         </Card>
      )}

      {!isLoading && !isError && contatos.length === 0 && (
         <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">{searchTerm ? "Nenhum contacto encontrado para a sua pesquisa." : "Ainda não há contactos. Adicione o seu primeiro contacto!"}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && contatos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contatos.map((contato) => (
            <Card key={contato.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{contato.nome}</span>
                    <Badge className={`${getCorCargo(contato.cargo)} text-white`}>{contato.cargo}</Badge>
                </CardTitle>
              </CardHeader>
              {/* CORREÇÃO APLICADA AQUI: */}
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">📞</span>
                        {contato.telefone}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatarData(contato.aniversario)}
                    </div>
                </div>
                {contato.observacoes && (
                    <div className="border-t pt-4">
                        <p className="text-sm">
                            <strong className="text-foreground">Observações:</strong>
                            <br/>
                            <span className="text-muted-foreground">{contato.observacoes}</span>
                        </p>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contatos;
