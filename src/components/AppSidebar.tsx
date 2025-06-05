
import { useState } from "react";
import { Calendar, User, FileText, List, Mail, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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
  { title: "Aniversariantes", url: "/aniversariantes", icon: Calendar },
  { title: "Despesas", url: "/despesas", icon: FileText },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Matérias", url: "/materias", icon: FileText },
];

interface AppSidebarProps {
  onLogout: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-political-blue text-white" : "hover:bg-muted/50";

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
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t">
          <SidebarMenuButton onClick={onLogout} className="w-full text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
