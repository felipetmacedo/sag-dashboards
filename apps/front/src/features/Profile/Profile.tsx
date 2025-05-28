import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/stores/user.store"
import { z } from "zod"
import { updateUserProfile } from '@/processes/user'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const updateProfileSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    phone_number: z.string().optional(),
    document: z.string().optional(),
    cep: z.string().optional(),
    address: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
})


type FormData = z.infer<typeof updateProfileSchema>

export function Profile() {
    const userInfo = useUserStore((state) => state.userInfo)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: userInfo?.name,
            email: userInfo?.email,
            phone_number: userInfo?.phone_number,
            document: userInfo?.document,
            cep: userInfo?.cep,
            address: userInfo?.address,
            number: userInfo?.number,
            complement: userInfo?.complement,
            neighborhood: userInfo?.neighborhood,
            city: userInfo?.city,
            state: userInfo?.state,
        }
    })

    const getInitials = (name: string | undefined) => {
        if (!name) return "??";
        const words = name.split(" ");
        const firstInitial = words[0]?.charAt(0) || "";
        const lastInitial = words.length > 1 ? words[words.length - 1].charAt(0) : "";
        return (firstInitial + lastInitial).toUpperCase();
    };

    const onSubmit = async (data: FormData) => {
        try {
            if (!userInfo?.id) {
                toast.error("ID do usuário não encontrado");
                return;
            }

            await updateUserProfile(data);

            toast.success("Perfil atualizado com sucesso!");

            reset({
                name: data.name,
                email: data.email,
                phone_number: data.phone_number,
                document: data.document,
                cep: data.cep,
                address: data.address,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
            }, { keepValues: true });

        } catch {
            toast.error("Erro ao atualizar perfil");
        }
    };

    return (
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-6">Perfil</h1>

                <Tabs defaultValue="general" className="space-y-4">
                    {/* <TabsList>
                        <TabsTrigger value="general">Geral</TabsTrigger>
                        <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
                    </TabsList> */}

                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src="" alt="Avatar" />
                                            <AvatarFallback>
                                                {getInitials(userInfo?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-medium">Seu avatar</h3>
                                        </div>
                                        {/* <Button type="button" variant="secondary">Add</Button> */}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome</Label>
                                            <Input {...register("name")} />
                                            {errors.name && (
                                                <span className="text-sm text-red-500">{errors.name.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input {...register("email")} type="email" />
                                            {errors.email && (
                                                <span className="text-sm text-red-500">{errors.email.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone_number">Telefone</Label>
                                            <Input {...register("phone_number")} />
                                            {errors.phone_number && (
                                                <span className="text-sm text-red-500">{errors.phone_number.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="document">Documento</Label>
                                            <Input {...register("document")} />
                                            {errors.document && (
                                                <span className="text-sm text-red-500">{errors.document.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cep">CEP</Label>
                                            <Input {...register("cep")} />
                                            {errors.cep && (
                                                <span className="text-sm text-red-500">{errors.cep.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Endereço</Label>
                                            <Input {...register("address")} />
                                            {errors.address && (
                                                <span className="text-sm text-red-500">{errors.address.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="number">Número</Label>
                                            <Input {...register("number")} />
                                            {errors.number && (
                                                <span className="text-sm text-red-500">{errors.number.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="complement">Complemento</Label>
                                            <Input {...register("complement")} />
                                            {errors.complement && (
                                                <span className="text-sm text-red-500">{errors.complement.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="neighborhood">Bairro</Label>
                                            <Input {...register("neighborhood")} />
                                            {errors.neighborhood && (
                                                <span className="text-sm text-red-500">{errors.neighborhood.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="city">Cidade</Label>
                                            <Input {...register("city")} />
                                            {errors.city && (
                                                <span className="text-sm text-red-500">{errors.city.message}</span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">Estado</Label>
                                            <Input {...register("state")} />
                                            {errors.state && (
                                                <span className="text-sm text-red-500">{errors.state.message}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Salvando..." : "Salvar alterações"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* <TabsContent value="subscriptions" className="space-y-6">
                        <Subscription billingHistory={payments} />
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    )
}
