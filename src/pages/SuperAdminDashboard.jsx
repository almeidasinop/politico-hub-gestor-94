import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, BarChart2, Loader2, PlusCircle, Edit, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

// --- Componente para Gerenciar Gabinetes ---
const GerenciarGabinetes = ({ gabinetes, isLoading }) => {
  const [novoGabinete, setNovoGabinete] = useState({ nome: '', vencimento: '', ativo: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddGabinete = async (e) => {
    e.preventDefault();
    if (!novoGabinete.nome.trim() || !novoGabinete.vencimento) {
      toast({ title: "Erro", description: "Preencha o nome e a data de vencimento.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "gabinetes"), {
        nome: novoGabinete.nome,
        ativo: novoGabinete.ativo,
        vencimento: new Date(novoGabinete.vencimento),
        createdAt: serverTimestamp(),
      });
      toast({ title: "Sucesso!", description: "Gabinete adicionado." });
      setNovoGabinete({ nome: '', vencimento: '', ativo: true });
    } catch (error) {
      console.error("Erro ao adicionar gabinete: ", error);
      toast({ title: "Erro", description: "Não foi possível adicionar o gabinete.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Gabinetes</CardTitle>
        <CardDescription>Adicione e administre os gabinetes da plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddGabinete} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 p-4 border rounded-lg">
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="nome-gabinete">Nome do Gabinete</Label>
            <Input id="nome-gabinete" placeholder="Ex: Gabinete Vereador João" value={novoGabinete.nome} onChange={(e) => setNovoGabinete({ ...novoGabinete, nome: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="vencimento-gabinete">Vencimento</Label>
            <Input id="vencimento-gabinete" type="date" value={novoGabinete.vencimento} onChange={(e) => setNovoGabinete({ ...novoGabinete, vencimento: e.target.value })} />
          </div>
          <div className="flex flex-col items-start gap-2">
             <Label htmlFor="status-gabinete">Status</Label>
             <div className="flex items-center gap-2">
                <Switch id="status-gabinete" checked={novoGabinete.ativo} onCheckedChange={(checked) => setNovoGabinete({ ...novoGabinete, ativo: checked })} />
                <Label>{novoGabinete.ativo ? "Ativo" : "Inativo"}</Label>
             </div>
          </div>
          <Button type="submit" className="md:col-start-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Adicionar Gabinete
          </Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : (
              gabinetes.map(gabinete => <GabineteRow key={gabinete.id} gabinete={gabinete} />)
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const GabineteRow = ({ gabinete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState({ ativo: gabinete.ativo, vencimento: gabinete.vencimento?.toDate().toISOString().split('T')[0] || '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setIsUpdating(true);
    const gabineteRef = doc(db, "gabinetes", gabinete.id);
    try {
      await updateDoc(gabineteRef, {
        ativo: dadosEdicao.ativo,
        vencimento: new Date(dadosEdicao.vencimento)
      });
      toast({ title: "Sucesso!", description: "Gabinete atualizado." });
      setIsOpen(false);
    } catch (error) {
       console.error("Erro ao atualizar gabinete: ", error);
       toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const isVencido = gabinete.vencimento && new Date() > gabinete.vencimento.toDate();

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{gabinete.nome}</TableCell>
        <TableCell>
          <Badge variant={gabinete.ativo && !isVencido ? "default" : "destructive"} className={gabinete.ativo && !isVencido ? 'bg-green-500' : ''}>
            {gabinete.ativo && !isVencido ? "Ativo" : isVencido ? "Vencido" : "Inativo"}
          </Badge>
        </TableCell>
        <TableCell>{gabinete.vencimento ? gabinete.vencimento.toDate().toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
        <TableCell className="text-right">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Gabinete: {gabinete.nome}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-vencimento">Vencimento</Label>
                  <Input id="edit-vencimento" type="date" value={dadosEdicao.vencimento} onChange={(e) => setDadosEdicao({...dadosEdicao, vencimento: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="edit-status" checked={dadosEdicao.ativo} onCheckedChange={(checked) => setDadosEdicao({...dadosEdicao, ativo: checked})} />
                  <Label htmlFor="edit-status">{dadosEdicao.ativo ? "Ativo" : "Inativo"}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    </>
  );
};


// --- Componente para Gerenciar Usuários ---
const GerenciarUsuarios = ({ usuarios, gabinetes, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Usuários</CardTitle>
        <CardDescription>Visualize e administre todos os usuários do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Gabinete</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : (
              usuarios.map(user => <UsuarioRow key={user.id} user={user} gabinetes={gabinetes} />)
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const UsuarioRow = ({ user, gabinetes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGabinete, setSelectedGabinete] = useState(user.gabineteId || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // CORREÇÃO: Lógica para buscar o nome do gabinete movida para dentro e otimizada
  const gabineteName = useMemo(() => {
    if (!user.gabineteId) return <span className="text-muted-foreground">Nenhum</span>;
    const gabinete = gabinetes.find(g => g.id === user.gabineteId);
    return gabinete ? (gabinete.nome || 'Nome Inválido') : <span className="text-red-500">Gabinete Inválido</span>;
  }, [user.gabineteId, gabinetes]);


  const handleAssign = async () => {
    setIsUpdating(true);
    const userRef = doc(db, "users", user.id);
    try {
      await updateDoc(userRef, {
        gabineteId: selectedGabinete
      });
      toast({ title: "Sucesso!", description: "Usuário atualizado." });
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao vincular usuário: ", error);
      toast({ title: "Erro", description: "Não foi possível vincular o usuário.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <TableRow>
        {/* CORREÇÃO: Adicionado fallback para dados do usuário */}
        <TableCell className="font-medium">{user?.name || 'Sem nome'}</TableCell>
        <TableCell>{user?.email || 'Sem email'}</TableCell>
        <TableCell>{user?.role || 'Sem função'}</TableCell>
        <TableCell>{gabineteName}</TableCell>
        <TableCell className="text-right">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><UserCog className="mr-2 h-4 w-4" />Gerenciar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vincular Usuário</DialogTitle>
                <DialogDescription>Vincule {user.name || 'este usuário'} a um gabinete.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="gabinete-select">Selecione o Gabinete</Label>
                <Select value={selectedGabinete} onValueChange={setSelectedGabinete}>
                  <SelectTrigger id="gabinete-select">
                    <SelectValue placeholder="Selecione um gabinete..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {gabinetes.map(g => <SelectItem key={g.id} value={g.id}>{g.nome || 'Nome Inválido'}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button onClick={handleAssign} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    </>
  );
};


// --- Componente de Relatórios ---
const RelatoriosSistema = ({ gabinetes, usuarios, isLoading }) => (
  <Card>
    <CardHeader>
      <CardTitle>Relatórios do Sistema</CardTitle>
      <CardDescription>Métricas de uso e relatórios gerais da plataforma.</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Gabinetes</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{gabinetes.length}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{usuarios.length}</div>}
        </CardContent>
      </Card>
    </CardContent>
  </Card>
);

// --- Componente Principal do Dashboard ---
const SuperAdminDashboard = () => {
  const [gabinetes, setGabinetes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isGabinetesLoading, setIsGabinetesLoading] = useState(true);
  const [isUsuariosLoading, setIsUsuariosLoading] = useState(true);

  useEffect(() => {
    const unsubGabinetes = onSnapshot(collection(db, "gabinetes"), (snapshot) => {
      setGabinetes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsGabinetesLoading(false);
    });
    const unsubUsuarios = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsUsuariosLoading(false);
    });
    
    return () => {
      unsubGabinetes();
      unsubUsuarios();
    };
  }, []);

  const isLoading = isGabinetesLoading || isUsuariosLoading;

  return (
    <Tabs defaultValue="gabinetes" className="w-full">
      <TabsList className="flex w-full mb-4">
        <TabsTrigger value="gabinetes" className="flex-1"><Building className="mr-2 h-4 w-4"/>Gabinetes</TabsTrigger>
        <TabsTrigger value="usuarios" className="flex-1"><Users className="mr-2 h-4 w-4"/>Usuários</TabsTrigger>
        <TabsTrigger value="relatorios" className="flex-1"><BarChart2 className="mr-2 h-4 w-4"/>Relatórios</TabsTrigger>
      </TabsList>
      <TabsContent value="gabinetes">
        <GerenciarGabinetes gabinetes={gabinetes} isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="usuarios">
        <GerenciarUsuarios usuarios={usuarios} gabinetes={gabinetes} isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="relatorios">
        <RelatoriosSistema gabinetes={gabinetes} usuarios={usuarios} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
};

export default SuperAdminDashboard;
