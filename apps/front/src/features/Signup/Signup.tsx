import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Waves } from "@/components/ui/wave-background";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { EyeOffIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import InputMask from 'react-input-mask';

import useSignupContainer from "./Signup.container";

const Signup = () => {
  const {
    register,
    handleSubmit,
    errors,
    isPending,
    onSubmit,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isValidToken
  } = useSignupContainer();

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Token de registro inválido ou não fornecido. Por favor, use um link de convite válido.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1">
      <div className="w-full bg-slate-200 flex-col items-center justify-center antialiased relative hidden lg:block">
        <div className="absolute inset-0">
          <Waves
            lineColor="rgba(0, 0, 0, 0.3)"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 lg:flex-none sm:px-6 lg:px-8 mt-12">
        <div className="mx-auto w-full max-w-sm min-w-[400px]">
          <Card className="md:min-w-[400px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold">Crie sua conta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome"
                    {...register("name")}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name &&
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email &&
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_number">CPF/CNPJ</Label>
                  <Input
                    id="document_number"
                    type="text"
                    placeholder="000.000.000-00"
                    {...register("document_number")}
                    aria-invalid={errors.document_number ? "true" : "false"}
                  />
                  {errors.document_number &&
                    <p className="text-sm text-destructive">
                      {errors.document_number.message}
                    </p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Telefone</Label>
                  <InputMask mask="(99)99999-9999" {...register("phone_number")}>
                    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => <Input placeholder="(00) 00000-0000" {...inputProps} />}
                  </InputMask>
                  {errors.phone_number &&
                    <p className="text-sm text-destructive">
                      {errors.phone_number.message}
                    </p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword
                        ? <EyeOffIcon className="h-4 w-4" />
                        : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password &&
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword
                        ? <EyeOffIcon className="h-4 w-4" />
                        : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword &&
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
