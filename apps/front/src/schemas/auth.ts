import * as yup from 'yup';

export const loginSchema = yup.object({
    usuario: yup.string().required(),
    senha: yup.string().required()
});
