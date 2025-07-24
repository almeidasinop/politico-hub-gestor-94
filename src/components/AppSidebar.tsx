import { Calendar, User, FileText, List, LogOut, MapPin, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils"; 
import { useAuth } from "@/hooks/use-auth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Inicio", url: "/", icon: List },
  { title: "Contatos", url: "/contatos", icon: User },
  { title: "Visitas", url: "/visitas", icon: MapPin },
  { title: "Aniversariantes", url: "/aniversariantes", icon: Calendar },
  { title: "Despesas", url: "/despesas", icon: FileText },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Matérias", url: "/materias", icon: FileText },
];

const adminMenuItems = [
    { title: "Configurações", url: "/configuracoes", icon: Settings }
];

export function AppSidebar({ onLogout }: { onLogout: () => void; }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { userProfile } = useAuth(); // Obter o perfil do usuário

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      {/* O SidebarTrigger que estava aqui foi removido */}

      <SidebarContent className="bg-white border-r">
        {/* CORREÇÃO: Lógica de renderização separada para o estado recolhido */}
        <div className={`border-b ${collapsed ? 'py-4' : 'p-4'}`}>
          {collapsed ? (
            <img src="/logo.png" alt="Logo do Sistema" className="h-8 w-8 rounded-md mx-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo do Sistema" className="h-8 w-8 rounded-md flex-shrink-0" />
              <h2 className="font-bold text-political-navy text-lg">
                Gestão de Gabinete
              </h2>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-political-gray">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={({ isActive }) => cn("w-full justify-start text-slate-600", isActive ? "bg-political-blue hover:bg-political-blue/90" : "hover:bg-muted/50 hover:text-slate-800")}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Menu de Administração - visível apenas para admins */}
        {userProfile?.role === 'admin' && (
             <SidebarGroup>
               <SidebarGroupLabel className="text-political-gray">Administração</SidebarGroupLabel>
               <SidebarGroupContent>
                   <SidebarMenu>
                   {adminMenuItems.map((item) => (
                       <SidebarMenuItem key={item.title}>
                       <SidebarMenuButton asChild>
                           <NavLink to={item.url} end className={({ isActive }) => cn("w-full justify-start text-slate-600", isActive ? "bg-political-blue hover:bg-political-blue/90" : "hover:bg-muted/50 hover:text-slate-800")}>
                           <item.icon className="h-4 w-4" />
                           {!collapsed && <span>{item.title}</span>}
                           </NavLink>
                       </SidebarMenuButton>
                       </SidebarMenuItem>
                   ))}
                   </SidebarMenu>
               </SidebarGroupContent>
             </SidebarGroup>
        )}

        <div className="mt-auto p-4 border-t">
          <SidebarMenuButton onClick={onLogout} className="w-full text-red-600 hover:bg-red-50 justify-start">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
