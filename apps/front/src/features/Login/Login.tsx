import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import useLoginPageContainer from './Login.container';

export default function Login() {
	const {
		register,
		handleSubmit,
		onSubmit,
		errors,
		isLoading,
	} = useLoginPageContainer() || {};

	return (
		<div className="flex min-h-screen flex-1">
			<div className="w-full bg-slate-200 flex flex-col items-center justify-center antialiased relative hidden lg:block">
				<div className="absolute inset-0">
					<img src="/background-sag.jpeg" alt="" className="w-full h-full object-cover object-center"/>
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
								Código de autenticação para acessar o SAG dashboards
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="token">Código</Label>
									<Input
										id="token"
										type="text"
										placeholder="Código de autenticação"
										{...register('token')}
										aria-invalid={
											errors.token ? 'true' : 'false'
										}
									/>
									{errors.token && (
										<p className="text-sm text-red-500">
											Código é obrigatório
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
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
