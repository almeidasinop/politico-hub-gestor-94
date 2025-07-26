import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '@/lib/firebase'; // Importar auth
import { initializeApp, deleteApp } from 'firebase/app'; // Importar funções de app
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Importar função de criação de usuário
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, setDoc, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, BarChart2, Loader2, PlusCircle, Edit, UserCog, UserPlus, Filter, FileText, MapPin } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      <CardContent className="p-3 sm:p-4 md:p-6">
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
          <Button type="submit" className="w-full md:w-auto md:col-start-4" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Adicionar Gabinete
          </Button>
        </form>
        <div className="overflow-x-auto">
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
        </div>
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
        <TableCell className="font-medium whitespace-nowrap">{gabinete.nome}</TableCell>
        <TableCell>
          <Badge variant={gabinete.ativo && !isVencido ? "default" : "destructive"} className={gabinete.ativo && !isVencido ? 'bg-green-500' : ''}>
            {gabinete.ativo && !isVencido ? "Ativo" : isVencido ? "Vencido" : "Inativo"}
          </Badge>
        </TableCell>
        <TableCell className="whitespace-nowrap">{gabinete.vencimento ? gabinete.vencimento.toDate().toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
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
                  <Label htmlFor={`edit-vencimento-${gabinete.id}`}>Vencimento</Label>
                  <Input id={`edit-vencimento-${gabinete.id}`} type="date" value={dadosEdicao.vencimento} onChange={(e) => setDadosEdicao({...dadosEdicao, vencimento: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id={`edit-status-${gabinete.id}`} checked={dadosEdicao.ativo} onCheckedChange={(checked) => setDadosEdicao({...dadosEdicao, ativo: checked})} />
                  <Label htmlFor={`edit-status-${gabinete.id}`}>{dadosEdicao.ativo ? "Ativo" : "Inativo"}</Label>
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
  const [filtroGabinete, setFiltroGabinete] = useState('all');

  const usuariosFiltrados = useMemo(() => {
    if (filtroGabinete === 'all') {
      return usuarios;
    }
    if (filtroGabinete === 'none') {
      return usuarios.filter(user => !user.gabineteId);
    }
    return usuarios.filter(user => user.gabineteId === filtroGabinete);
  }, [usuarios, filtroGabinete]);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>Visualize e administre todos os usuários do sistema.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="w-full sm:w-64">
                <Select value={filtroGabinete} onValueChange={setFiltroGabinete}>
                    <SelectTrigger><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Gabinetes</SelectItem>
                        <SelectItem value="none">Nenhum Gabinete</SelectItem>
                        {gabinetes.map(g => <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <CreateUserDialog gabinetes={gabinetes} />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="overflow-x-auto">
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
                usuariosFiltrados.map(user => <UsuarioRow key={user.id} user={user} gabinetes={gabinetes} />)
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Diálogo de Criação de Usuário ---
const CreateUserDialog = ({ gabinetes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', role: 'user', gabineteId: 'none' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.senha || !formData.role) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const tempAppName = `temp-user-creation-${Date.now()}`;
    const tempApp = initializeApp(auth.app.options, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(tempAuth, formData.email, formData.senha);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: formData.nome,
        email: formData.email,
        role: formData.role,
        gabineteId: formData.gabineteId === 'none' ? '' : formData.gabineteId,
        createdAt: serverTimestamp()
      });

      toast({ title: "Sucesso!", description: "Usuário criado com sucesso." });
      setIsOpen(false);
      setFormData({ nome: '', email: '', senha: '', role: 'user', gabineteId: 'none' });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      const description = error.code === 'auth/email-already-in-use' 
        ? "Este e-mail já está em uso."
        : "Não foi possível criar o usuário.";
      toast({ title: "Erro", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      await deleteApp(tempApp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto"><UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>Preencha os dados para criar um novo acesso ao sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateUser} className="space-y-4 py-4">
          <div>
            <Label htmlFor="create-nome">Nome</Label>
            <Input id="create-nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="create-email">Email</Label>
            <Input id="create-email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="create-senha">Senha</Label>
            <Input id="create-senha" type="password" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="create-role">Função</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger id="create-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="create-gabinete">Vincular a Gabinete</Label>
            <Select value={formData.gabineteId} onValueChange={(value) => setFormData({...formData, gabineteId: value})}>
              <SelectTrigger id="create-gabinete"><SelectValue placeholder="Opcional..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {Array.isArray(gabinetes) && gabinetes.map(g => <SelectItem key={g.id} value={g.id}>{g.nome || 'Nome Inválido'}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const UsuarioRow = ({ user, gabinetes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGabinete, setSelectedGabinete] = useState(user.gabineteId || 'none');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const gabineteName = useMemo(() => {
    if (!Array.isArray(gabinetes)) return <span className="text-muted-foreground">Carregando...</span>;
    if (!user.gabineteId) return <span className="text-muted-foreground">Nenhum</span>;
    
    const gabinete = gabinetes.find(g => g.id === user.gabineteId);
    return gabinete ? (gabinete.nome || 'Nome Inválido') : <span className="text-red-500">Gabinete Inválido</span>;
  }, [user.gabineteId, gabinetes]);


  const handleAssign = async () => {
    setIsUpdating(true);
    const userRef = doc(db, "users", user.id);
    try {
      const gabineteParaSalvar = selectedGabinete === 'none' ? '' : selectedGabinete;
      await updateDoc(userRef, {
        gabineteId: gabineteParaSalvar
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
        <TableCell className="font-medium whitespace-nowrap">{user?.name || 'Sem nome'}</TableCell>
        <TableCell className="whitespace-nowrap">{user?.email || 'Sem email'}</TableCell>
        <TableCell>{user?.role || 'Sem função'}</TableCell>
        <TableCell className="whitespace-nowrap">{gabineteName}</TableCell>
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
                <Label htmlFor={`gabinete-select-${user.id}`}>Selecione o Gabinete</Label>
                <Select value={selectedGabinete} onValueChange={setSelectedGabinete}>
                  <SelectTrigger id={`gabinete-select-${user.id}`}>
                    <SelectValue placeholder="Selecione um gabinete..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {Array.isArray(gabinetes) && gabinetes.map(g => <SelectItem key={g.id} value={g.id}>{g.nome || 'Nome Inválido'}</SelectItem>)}
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
const RelatoriosSistema = ({ gabinetes, usuarios, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios por Gabinete</CardTitle>
        <CardDescription>Clique em um gabinete para ver suas estatísticas detalhadas.</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {gabinetes.map(gabinete => (
              <AccordionItem value={gabinete.id} key={gabinete.id}>
                <AccordionTrigger>{gabinete.nome}</AccordionTrigger>
                <AccordionContent>
                  <GabineteStats gabineteId={gabinete.id} usuarios={usuarios} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

// --- Componente para buscar e exibir estatísticas de um gabinete ---
const GabineteStats = ({ gabineteId, usuarios }) => {
  const [stats, setStats] = useState({ contatos: 0, visitas: 0, materias: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const contatosColl = collection(db, `gabinetes/${gabineteId}/contatos`);
        const visitasColl = collection(db, `gabinetes/${gabineteId}/visitas`);
        const materiasColl = collection(db, `gabinetes/${gabineteId}/materias`);

        const [contatosSnap, visitasSnap, materiasSnap] = await Promise.all([
          getCountFromServer(contatosColl),
          getCountFromServer(visitasColl),
          getCountFromServer(materiasColl),
        ]);

        setStats({
          contatos: contatosSnap.data().count,
          visitas: visitasSnap.data().count,
          materias: materiasSnap.data().count,
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas do gabinete:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [gabineteId]);

  const usuariosDoGabinete = useMemo(() => {
    return usuarios.filter(u => u.gabineteId === gabineteId).length;
  }, [usuarios, gabineteId]);

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
      <StatCard icon={Users} title="Usuários" value={usuariosDoGabinete} />
      <StatCard icon={Users} title="Contatos" value={stats.contatos} />
      <StatCard icon={MapPin} title="Visitas" value={stats.visitas} />
      <StatCard icon={FileText} title="Matérias" value={stats.materias} />
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-background rounded-lg border">
    <Icon className="h-6 w-6 text-muted-foreground mb-2" />
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{title}</p>
  </div>
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
      <div className="w-full overflow-x-auto pb-2">
        <TabsList className="inline-flex w-full min-w-max mb-4">
          <TabsTrigger value="gabinetes" className="flex-1"><Building className="mr-2 h-4 w-4"/>Gabinetes</TabsTrigger>
          <TabsTrigger value="usuarios" className="flex-1"><Users className="mr-2 h-4 w-4"/>Usuários</TabsTrigger>
          <TabsTrigger value="relatorios" className="flex-1"><BarChart2 className="mr-2 h-4 w-4"/>Relatórios</TabsTrigger>
        </TabsList>
      </div>
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
