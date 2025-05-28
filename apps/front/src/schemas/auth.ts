import * as yup from 'yup';

export const loginSchema = yup.object({
    token: yup.string().required()
});
