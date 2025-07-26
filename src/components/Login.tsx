import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const Login = () => {
  // CORREÇÃO: Usar os nomes corretos exportados pelo hook use-auth.tsx
  const { logIn, isLoading, error } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // CORREÇÃO: Chamar a função 'logIn' com 'I' maiúsculo
    logIn(loginEmail, loginPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-political-blue to-political-navy p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="Logo do Sistema" className="h-16 w-16 mx-auto mb-4 rounded-lg" />
          <CardTitle className="text-2xl text-political-navy">Sistema de Gestão de Gabinete</CardTitle>
          <CardDescription>Acesse o seu gabinete com as suas credenciais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input id="login-password" type="password" placeholder="Sua senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            {/* Adicionado para exibir mensagens de erro do hook */}
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {/* CORREÇÃO: Usar 'isLoading' para desativar o botão e mostrar o loader */}
            <Button type="submit" className="w-full bg-political-blue hover:bg-political-navy" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
