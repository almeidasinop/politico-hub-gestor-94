import { Calendar, User, FileText, List, Mail, LogOut, MapPin, Settings } from "lucide-react"; // Adicionado Settings
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils"; 
import { useAuth } from "@/hooks/use-auth"; // Importar useAuth para verificar a função

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
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
  const { userProfile } = useAuth(); // Obter o perfil do utilizador

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="bg-white border-r">
        <div className="p-4 border-b">
          <h2 className={`font-bold text-political-navy ${collapsed ? 'text-xs' : 'text-lg'}`}>
            {collapsed ? 'SGP' : 'Sistema de Gestão Política'}
          </h2>
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
