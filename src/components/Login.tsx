import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/use-auth';

const Login = () => {
  const { signIn, signUp, isAuthenticating } = useAuth();
  
  // Estados para o formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para o formulário de registo
  const [registerGabinete, setRegisterGabinete] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');


  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(loginEmail, loginPassword);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerGabinete || !registerName || !registerEmail || !registerPassword) {
      // Idealmente, usar um toast para notificar o utilizador
      return;
    }
    signUp({
      gabineteName: registerGabinete,
      userName: registerName,
      email: registerEmail,
      password: registerPassword
    });
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
          <Tabs defaultValue="login" className="w-full">

            {/* Aba de Login */}
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" placeholder="Sua senha" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-political-blue hover:bg-political-navy" disabled={isAuthenticating}>
                  {isAuthenticating ? 'A entrar...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
