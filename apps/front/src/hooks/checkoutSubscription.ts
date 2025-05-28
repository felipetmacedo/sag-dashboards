import { useMutation } from '@tanstack/react-query'
import { checkoutSubscription } from '@/processes/subscription'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'

export function useCheckoutSubscription() {
    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    return useMutation({
        mutationFn: checkoutSubscription,
        onSuccess: async (data) => {
            const stripe = await stripePromise;

            if (!stripe) {
                toast.error("Stripe failed to load");
                throw new Error("Stripe failed to load");
            }

            const { error } = await stripe.redirectToCheckout({
                sessionId: data.id
            });

            if (error) {
                toast.error(error.message);
                throw new Error(error.message);
            }
        },
        onError: (error) => {
            console.error('Erro ao iniciar checkout:', error)
            toast.error('Erro ao iniciar checkout')
        }
    })
}