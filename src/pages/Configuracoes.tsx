import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, User, ShieldCheck, UserPlus, Loader2, UserCog } from 'lucide-react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/components/ui/use-toast";
import { db, auth } from '@/lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';


// --- Diálogo de Criação de Utilizador (para Admins de Gabinete) ---
const CreateTeamMemberDialog = () => {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.senha) {
      toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
      return;
    }
    if (!userProfile?.gabineteId) {
      toast({ title: "Erro", description: "Você não está vinculado a um gabinete.", variant: "destructive" });
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
        role: 'user', // Novos membros são sempre 'user'
        gabineteId: userProfile.gabineteId, // Vincula ao gabinete do admin
        ativo: true, // Novo utilizador começa como ativo
        createdAt: serverTimestamp()
      });

      toast({ title: "Sucesso!", description: "Membro da equipa adicionado." });
      setIsOpen(false);
      setFormData({ nome: '', email: '', senha: '' });
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      const description = error.code === 'auth/email-already-in-use' 
        ? "Este e-mail já está em uso."
        : "Não foi possível criar o utilizador.";
      toast({ title: "Erro", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      await deleteApp(tempApp);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Adicionar Membro</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Membro à Equipa</DialogTitle>
          <DialogDescription>Crie um novo acesso para um membro da sua equipa.</DialogDescription>
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
            <Label htmlFor="create-senha">Senha Provisória</Label>
            <Input id="create-senha" type="password" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Componente para a linha de cada membro da equipa ---
const TeamMemberRow = ({ membro }: { membro: any }) => {
    const { userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: membro.name, ativo: membro.ativo !== false });
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const handleUpdate = async () => {
        setIsUpdating(true);
        const userRef = doc(db, "users", membro.uid);
        try {
            await updateDoc(userRef, {
                name: formData.name,
                ativo: formData.ativo,
            });
            toast({ title: "Sucesso!", description: "Dados do membro atualizados." });
            setIsOpen(false);
        } catch (error) {
            console.error("Erro ao atualizar membro:", error);
            toast({ title: "Erro", description: "Não foi possível atualizar os dados.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    // Um admin não pode editar a si mesmo ou outro admin
    const canManage = userProfile?.role === 'admin' && membro.role !== 'admin';

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-medium text-political-navy">{membro.name}</p>
                    <p className="text-sm text-muted-foreground">{membro.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={membro.ativo !== false ? 'default' : 'destructive'} className={membro.ativo !== false ? 'bg-green-500' : ''}>
                    {membro.ativo !== false ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant={membro.role === 'admin' ? 'default' : 'secondary'} className={membro.role === 'admin' ? 'bg-political-blue' : ''}>
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    {membro.role}
                </Badge>
                {canManage && (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon"><UserCog className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Gerir Membro: {membro.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor={`edit-name-${membro.uid}`}>Nome</Label>
                                    <Input id={`edit-name-${membro.uid}`} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch id={`edit-status-${membro.uid}`} checked={formData.ativo} onCheckedChange={(checked) => setFormData({...formData, ativo: checked})} />
                                    <Label htmlFor={`edit-status-${membro.uid}`}>{formData.ativo ? "Acesso Ativo" : "Acesso Inativo"}</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                                <Button onClick={handleUpdate} disabled={isUpdating}>
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Alterações
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};


const Configuracoes = () => {
  const { equipe, isLoading, isError } = useConfiguracoes();
  const { userProfile } = useAuth();

  // Filtra a equipa para não mostrar superadmins
  const filteredEquipe = useMemo(() => {
    return equipe.filter(membro => membro.role !== 'superadmin');
  }, [equipe]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-6 w-1/2" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-red-50 border-red-200 text-red-800">
        <CardContent className="text-center py-8 flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Ocorreu um erro ao carregar os dados da equipa.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-political-navy">Configurações do Gabinete</h1>
        <p className="text-muted-foreground">Gerencie a sua equipa e as configurações do sistema.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Equipa do Gabinete</CardTitle>
                <CardDescription>Utilizadores com acesso a este gabinete.</CardDescription>
            </div>
            {/* O botão de adicionar só aparece para admins */}
            {userProfile?.role === 'admin' && <CreateTeamMemberDialog />}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEquipe.map(membro => (
              // CORREÇÃO: Usando o email como fallback para a key, garantindo que seja sempre única.
              <TeamMemberRow key={membro.uid || membro.email} membro={membro} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
