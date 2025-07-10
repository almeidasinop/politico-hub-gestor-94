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
import Configuracoes from "./pages/Configuracoes"; // Adicionado
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from './hooks/use-auth';
import { firebaseInitialized } from "./lib/firebase";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, isLoading, logOut } = useAuth();

  if (!firebaseInitialized) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-red-50 text-red-800"><h1 className="text-2xl font-bold mb-4">Erro Crítico de Configuração</h1><p>Não foi possível ligar à base de dados. Verifique o seu ficheiro `.env` e as regras do Firebase.</p></div>;
  }
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">A carregar sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar onLogout={logOut} />
          <div className="flex-1 flex flex-col">
            <header className="h-12 flex items-center border-b bg-white px-4">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1"><h2 className="text-sm font-medium text-political-navy">Sistema de Gestão Política</h2></div>
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
                <Route path="/configuracoes" element={<Configuracoes />} /> {/* Adicionado */}
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
