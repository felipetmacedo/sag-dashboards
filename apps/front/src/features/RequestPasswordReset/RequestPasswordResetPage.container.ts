import * as yup from "yup";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { requestResetPassword } from "@/processes/auth";
import { requestPasswordResetSchema } from "@/schemas/auth";

type RequestPasswordResetFormData = yup.InferType<typeof requestPasswordResetSchema>;

export default function RequestPasswordResetPageContainer() {
    const [isLoading, setIsLoading] = useState(false);

    const { 
        register, 
        handleSubmit,
        formState: { errors }
    } = useForm<RequestPasswordResetFormData>({
        resolver: yupResolver(requestPasswordResetSchema)
    });

    const onSubmit = async (data: RequestPasswordResetFormData) => {
        try {
            setIsLoading(true);

            await requestResetPassword(data.email);

            toast.success("Solicitação de redefinição de senha enviada! Verifique seu email e o spam para um link de redefinição.");
        } catch (error) {
            toast.error((error as Error).message || "Solicitação de redefinição de senha falhou");
        } finally {
            setIsLoading(false);
        }
    };

    return { register, handleSubmit, errors, onSubmit, isLoading };
}