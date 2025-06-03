import * as yup from 'yup';
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { getUserLojas } from "@/processes/auth";
import { loginSchema } from "@/schemas/auth";
import { useLojasStore } from "@/stores/lojas.store";

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginContainer() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setLojas } = useLojasStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try { 
      setIsLoading(true);

      try {
        const response = await getUserLojas({
          usuario: data.usuario,
          senha: data.senha
        });

        setLojas(response);

        navigate("/dashboard");
        toast.success("Login realizado com sucesso!");
      } catch {
        toast.error("Token inválido!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    errors,
    onSubmit,
    handleSubmit,
    isLoading,
    showPassword,
    setShowPassword
  }
}