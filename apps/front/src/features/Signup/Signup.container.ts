import * as yup from "yup";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";

import { signup } from "@/processes/auth";
import { signupSchema } from "@/schemas/auth";

type SignupFormData = yup.InferType<typeof signupSchema>;

export default function SignupContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL search params
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      setToken(urlToken);
      setIsValidToken(true);
    } else {
      toast.error("Token de registro não encontrado. Acesso negado.");
      navigate('/login');
    }
  }, [location, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<
    SignupFormData
  >({
    resolver: yupResolver(signupSchema)
  });

  const { mutate: signupFn, isPending } = useMutation({
    mutationFn: async (credentials: SignupFormData) => {
      // Only proceed if token is valid
      if (!isValidToken) {
        throw new Error("Token inválido ou não fornecido");
      }
      
      await signup({
        ...credentials,
        token: token || undefined
      });
    },
    onSuccess: () => {
      toast.success("Conta criada com sucesso!");
      navigate("/login");
    },
    onError: (error) => {
      if (error.message === "Já existe um usuário com este email ou CPF.") {
        toast.error(error.message);
      } else {
        toast.error("Falha ao criar conta");
      }
    }
  });

  const onSubmit = (data: SignupFormData) => signupFn(data);

  return {
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
  }
}