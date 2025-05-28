import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Waves } from "@/components/ui/wave-background";

import useLoginPageContainer from './Login.container';

export default function Login() {
	const {
		register,
		handleSubmit,
		onSubmit,
		errors,
		isLoading,
		showPassword,
		setShowPassword,
	} = useLoginPageContainer() || {};

	return (
		<div className="flex min-h-screen flex-1">
			<div className="w-full bg-slate-200 flex flex-col items-center justify-center antialiased relative hidden lg:block">
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
			<div className="flex flex-1 flex-col justify-center px-4 py-12 lg:flex-none sm:px-6 lg:px-8">
				<div className="mx-auto w-full w-lg min-w-[400px]">
					<Card className="md:min-w-[400px]">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl font-semibold">
								Login
							</CardTitle>
							<CardDescription>
								Entre com seu email e senha para acessar o
								Apollo
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="exemplo@email.com"
										{...register('email')}
										aria-invalid={
											errors.email ? 'true' : 'false'
										}
									/>
									{errors.email && (
										<p className="text-sm text-red-500">
											Email é obrigatório
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="password">Senha</Label>
									<div className="relative">
										<Input
											id="password"
											type={
												showPassword
													? 'text'
													: 'password'
											}
											placeholder="••••••••"
											{...register('password')}
											aria-invalid={
												errors.password
													? 'true'
													: 'false'
											}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-1 top-1 h-8 w-8 px-0"
											onClick={() =>
												setShowPassword(!showPassword)
											}
										>
											{showPassword ? (
												<EyeOffIcon className="h-4 w-4" />
											) : (
												<EyeIcon className="h-4 w-4" />
											)}
										</Button>
									</div>
									{errors.password && (
										<p className="text-sm text-red-500">
											Senha é obrigatória
										</p>
									)}
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={isLoading}
								>
									{isLoading ? 'Entrando...' : 'Entrar'}
								</Button>
							</form>

							<div className="flex flex-col mt-4 space-y-2">
								<div className="flex text-sm">
									<span className="text-muted-foreground">
										Alterar senha?{' '}
										<Link
											to="/request-password-reset"
											className="font-medium text-primary hover:underline"
										>
											Redefina aqui!
										</Link>
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
