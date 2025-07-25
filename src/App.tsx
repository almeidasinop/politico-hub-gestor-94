import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Login from "@/components/Login";
import Dashboard from "./pages/Dashboard";
import Contatos from "./pages/Contatos";
import Aniversariantes from "./pages/Aniversariantes";
import Despesas from "./pages/Despesas";
import Agenda from "./pages/Agenda";
import Materias from "./pages/Materias";
import Visitas from "./pages/Visitas";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import { AuthProvider, useAuth } from './hooks/use-auth';
import { firebaseInitialized, db } from "./lib/firebase"; // Importar db
import { doc, getDoc } from 'firebase/firestore'; // Importar getDoc
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const queryClient = new QueryClient();

// Componente de Cabeçalho Personalizado
const AppHeader = () => {
  const { userProfile } = useAuth();
  const [gabineteNome, setGabineteNome] = useState('');

  useEffect(() => {
    const fetchGabineteNome = async () => {
      if (userProfile?.gabineteId) {
        const gabineteRef = doc(db, 'gabinetes', userProfile.gabineteId);
        const gabineteSnap = await getDoc(gabineteRef);
        if (gabineteSnap.exists()) {
          setGabineteNome(gabineteSnap.data().nome);
        }
      }
    };

    fetchGabineteNome();
  }, [userProfile]);

  const nomeUsuario = userProfile?.name?.split(' ')[0] || '';

  return (
    <div className="flex-1">
      <h2 className="text-sm font-medium text-political-navy">
        {`Bem-vindo(a), ${nomeUsuario}`}
        {gabineteNome && ` ao gabinete ${gabineteNome}`}
      </h2>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, isLoading, logOut, userProfile } = useAuth();

  if (!firebaseInitialized) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Erro Crítico de Configuração</h1><p>Não foi possível conectar à base de dados. Verifique seu arquivo `.env` e as regras do Firebase.</p></div>;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (userProfile?.role === 'superadmin') {
    return (
      <div className="min-h-screen flex flex-col w-full bg-gray-100">
        <header className="h-16 flex items-center justify-between border-b bg-white px-6 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-red-700">Painel do Super Administrador</h1>
          </div>
          <Button variant="ghost" onClick={logOut} className="text-slate-600 hover:bg-red-50 hover:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </header>
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl">
            <SuperAdminDashboard />
          </div>
        </main>
      </div>
    );
  }

  // Layout padrão para usuários normais
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar onLogout={logOut} />
          <div className="flex-1 flex flex-col">
            <header className="h-12 flex items-center border-b bg-white px-4">
              <SidebarTrigger className="mr-4" />
              {/* Componente de cabeçalho com a mensagem personalizada */}
              <AppHeader />
            </header>
            <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/contatos" element={<Contatos />} />
                  <Route path="/visitas" element={<Visitas />} />
                  <Route path="/aniversariantes" element={<Aniversariantes />} />
                  <Route path="/despesas" element={<Despesas />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/materias" element={<Materias />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
