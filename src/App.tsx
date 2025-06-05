
import { useState } from 'react';
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider collapsedWidth={56}>
            <div className="min-h-screen flex w-full bg-gray-50">
              <AppSidebar onLogout={handleLogout} />
              
              <div className="flex-1 flex flex-col">
                <header className="h-12 flex items-center border-b bg-white px-4">
                  <SidebarTrigger className="mr-4" />
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-political-navy">
                      Sistema de Gestão Política
                    </h2>
                  </div>
                </header>

                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/contatos" element={<Contatos />} />
                    <Route path="/aniversariantes" element={<Aniversariantes />} />
                    <Route path="/despesas" element={<Despesas />} />
                    <Route path="/agenda" element={<Agenda />} />
                    <Route path="/materias" element={<Materias />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
