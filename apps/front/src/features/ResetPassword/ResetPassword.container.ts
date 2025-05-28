import * as yup from "yup";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useNavigate } from "react-router-dom";

import { resetPasswordSchema } from "@/schemas/auth";
import { resetPassword, validateResetPassword } from "@/processes/auth";

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

export default function ResetPasswordContainer() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ResetPasswordFormData>({
        resolver: yupResolver(resetPasswordSchema)
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            setIsLoading(true);

            await resetPassword({ password: data.password, confirmPassword: data.confirmPassword, token });

            toast.success("Senha redefinida com sucesso!");
            navigate("/login");
        } catch {
            toast.error("Redefinição de senha falhou");
        } finally {
            setIsLoading(false);
        }
    };

    const validateToken = async () => {
        try {
            if (!token) {
                toast.error("Token de redefinição de senha inválido ou expirado");
                navigate("/login");
                return false;
            }

            await validateResetPassword(token);

            return true;
        } catch (error) {
            toast.error((error as Error).message || "Token de redefinição de senha inválido ou expirado");
            navigate("/login");
            return false;
        }
    };

    return { validateToken, register, handleSubmit, errors, onSubmit, isLoading, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword };
}
