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
import { User, Calendar, AlertCircle, Trash2, Pencil, Search } from 'lucide-react'; // Ícone de busca adicionado
import { useContatos, type NovoContato } from '@/hooks/use-contatos';

interface Contato {
    id: string; 
    nome: string;
    telefone: string;
    aniversario: string;
    cargo: string;
    observacoes: string;
}

const Contatos = () => {
    const { 
        contatos, isLoading, isError, addContato, updateContato, deleteContato,
        isAdding, isUpdating, isDeleting,
        searchTerm, setSearchTerm,
        filtroCargo, setFiltroCargo,
        formatarData, getCorCargo 
    } = useContatos();

    const [novoContato, setNovoContato] = useState<NovoContato>({ nome: '', telefone: '', aniversario: '', cargo: 'Assessor', observacoes: '' });
    const [editingContato, setEditingContato] = useState<Contato | null>(null);
    const [deletingContato, setDeletingContato] = useState<Contato | null>(null);
    
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [captchaInput, setCaptchaInput] = useState('');
    const CAPTCHA_TEXT = 'APAGAR';

    // Estados locais para os campos de filtro
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localFiltroCargo, setLocalFiltroCargo] = useState('todos');

    const openEditDialog = (contato: Contato) => {
        setEditingContato(contato);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (contato: Contato) => {
        setDeletingContato(contato);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!novoContato.nome || !novoContato.telefone) { return; }
        addContato(novoContato, {
            onSuccess: () => {
                setNovoContato({ nome: '', telefone: '', aniversario: '', cargo: 'Assessor', observacoes: '' });
                setIsAddDialogOpen(false);
            }
        });
    };
    
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingContato) return;
        const { id, ...dataToUpdate } = editingContato;
        updateContato({id, data: dataToUpdate}, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setEditingContato(null);
            }
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingContato || captchaInput !== CAPTCHA_TEXT) {
            alert("Texto de confirmação incorreto.");
            return;
        }
        deleteContato(deletingContato.id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeletingContato(null);
                setCaptchaInput('');
            }
        });
    };

    // CORREÇÃO: A busca agora aplica ambos os filtros ao mesmo tempo.
    const handleSearch = () => {
        setSearchTerm(localSearchTerm);
        setFiltroCargo(localFiltroCargo);
    };

    // CORREÇÃO: Limpa os estados locais e os estados do hook.
    const handleClearSearch = () => {
        setLocalSearchTerm('');
        setLocalFiltroCargo('todos');
        setSearchTerm('');
        setFiltroCargo('todos');
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestão de Contatos</h1>
                    <p className="text-slate-500">Gerencie seus contatos políticos e relacionamentos</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-sky-600 hover:bg-sky-700 text-white w-full md:w-auto"><User className="mr-2 h-4 w-4" />Novo Contato</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Adicionar Novo Contato</DialogTitle><DialogDescription>Preencha as informações do novo contato.</DialogDescription></DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2"><Label htmlFor="nome">Nome Completo *</Label><Input id="nome" value={novoContato.nome} onChange={(e) => setNovoContato({ ...novoContato, nome: e.target.value })} required /></div>
                            <div className="space-y-2"><Label htmlFor="telefone">Telefone *</Label><Input id="telefone" value={novoContato.telefone} onChange={(e) => setNovoContato({ ...novoContato, telefone: e.target.value })} required /></div>
                            <div className="space-y-2"><Label htmlFor="aniversario">Data de Aniversário</Label><Input id="aniversario" type="date" value={novoContato.aniversario} onChange={(e) => setNovoContato({ ...novoContato, aniversario: e.target.value })} /></div>
                            <div className="space-y-2">
                                <Label htmlFor="cargo">Cargo ou Relação</Label>
                                <Select value={novoContato.cargo} onValueChange={(value) => setNovoContato({ ...novoContato, cargo: value })}>
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
                            <div className="space-y-2"><Label htmlFor="observacoes">Observações</Label><Textarea id="observacoes" value={novoContato.observacoes} onChange={(e) => setNovoContato({ ...novoContato, observacoes: e.target.value })} rows={3} /></div>
                            <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">Cancelar</Button><Button type="submit" disabled={isAdding} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">{isAdding ? 'Salvando...' : 'Salvar'}</Button></div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader><CardTitle>Pesquisar Contatos</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-2">
                        <Input 
                            placeholder="Pesquisar por nome..." 
                            value={localSearchTerm} 
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1" 
                        />
                        {/* CORREÇÃO: O Select agora usa o estado local */}
                        <Select value={localFiltroCargo} onValueChange={setLocalFiltroCargo}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filtrar por cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os Cargos</SelectItem>
                                <SelectItem value="Assessor">Assessor</SelectItem>
                                <SelectItem value="Jornalista">Jornalista</SelectItem>
                                <SelectItem value="Eleitor">Eleitor</SelectItem>
                                <SelectItem value="Empresário">Empresário</SelectItem>
                                <SelectItem value="Funcionário Público">Funcionário Público</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSearch} className="bg-sky-600 hover:bg-sky-700 text-white">
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                        {(searchTerm || filtroCargo !== 'todos') && (
                            <Button variant="ghost" onClick={handleClearSearch}>Limpar</Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isLoading && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => (<Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><div className="flex justify-end gap-2 mt-4"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /></div></CardContent></Card>))}</div>)}
            {isError && (<Card className="bg-red-50 border-red-200 text-red-800"><CardContent className="text-center py-8 flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /><p>Ocorreu um erro ao carregar os contatos.</p></CardContent></Card>)}
            {!isLoading && !isError && contatos.length === 0 && (<Card><CardContent className="text-center py-12"><p className="text-slate-500">{searchTerm || filtroCargo !== 'todos' ? "Nenhum contato encontrado." : "Ainda não há contatos cadastrados."}</p>{!(searchTerm || filtroCargo !== 'todos') && (<Button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setIsAddDialogOpen(true)}><User className="mr-2 h-4 w-4" />Adicionar Primeiro Contato</Button>)}</CardContent></Card>)}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {!isError && contatos.map((contato) => (
                    <Card key={contato.id} className="hover:shadow-lg transition-shadow flex flex-col">
                        <CardHeader><CardTitle className="flex items-center justify-between"><span className="text-lg">{contato.nome}</span><Badge className={`${getCorCargo(contato.cargo)} text-white border-transparent`}>{contato.cargo}</Badge></CardTitle></CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="flex items-center gap-2"><span>📞</span>{contato.telefone}</div>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatarData(contato.aniversario)}</div>
                            </div>
                            {contato.observacoes && (<div className="border-t pt-4"><p className="text-sm"><strong className="text-slate-800">Observações:</strong><br /><span className="text-slate-600">{contato.observacoes}</span></p></div>)}
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto"><div className="border-t pt-4 flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(contato)} disabled={isUpdating || isDeleting}><Pencil className="mr-2 h-4 w-4" />Editar</Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => openDeleteDialog(contato)} disabled={isUpdating || isDeleting}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
                        </div></div>
                    </Card>
                ))}
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Contato</DialogTitle><DialogDescription>Atualize as informações do contato.</DialogDescription></DialogHeader>
                    {editingContato && (
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2"><Label htmlFor="edit-nome">Nome *</Label><Input id="edit-nome" value={editingContato.nome} onChange={(e) => setEditingContato({...editingContato, nome: e.target.value})} required /></div>
                            <div className="space-y-2"><Label htmlFor="edit-telefone">Telefone *</Label><Input id="edit-telefone" value={editingContato.telefone} onChange={(e) => setEditingContato({...editingContato, telefone: e.target.value})} required /></div>
                            <div className="space-y-2"><Label htmlFor="edit-aniversario">Aniversário</Label><Input id="edit-aniversario" type="date" value={editingContato.aniversario} onChange={(e) => setEditingContato({...editingContato, aniversario: e.target.value})} /></div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cargo">Cargo</Label>
                                <Select value={editingContato.cargo} onValueChange={(value) => setEditingContato({...editingContato, cargo: value})}>
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
                            <div className="space-y-2"><Label htmlFor="edit-observacoes">Observações</Label><Textarea id="edit-observacoes" value={editingContato.observacoes} onChange={(e) => setEditingContato({...editingContato, observacoes: e.target.value})} rows={3} /></div>
                            <div className="flex gap-2 pt-4"><Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">Cancelar</Button><Button type="submit" disabled={isUpdating} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">{isUpdating ? 'Atualizando...' : 'Atualizar'}</Button></div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle><DialogDescription>Esta ação não pode ser desfeita. Para confirmar, digite <strong className="text-red-600">{CAPTCHA_TEXT}</strong> abaixo.</DialogDescription></DialogHeader>
                    {deletingContato && (
                        <div className="space-y-4 pt-4">
                            <Label htmlFor="captcha">Confirmação para <strong className="text-slate-800">{deletingContato.nome}</strong></Label>
                            <Input id="captcha" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder={`Digite ${CAPTCHA_TEXT}`} />
                            <div className="flex gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setCaptchaInput(''); }} className="flex-1">Cancelar</Button>
                                <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={captchaInput !== CAPTCHA_TEXT || isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300">{isDeleting ? 'Excluindo...' : 'Excluir Permanentemente'}</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Contatos;
