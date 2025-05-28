import api from "@/api";

// export interface CheckoutResponse {
//     data: {
//         url: string
//     }
// }

export const checkoutSubscription = async (planModel: 'MONTHLY' | 'YEARLY') => {
    const response = await api.post('/subscription/checkout', { planModel })
    return response.data
}

export const getSubscriptionInfo = async () => {
    try {
        const { data } = await api.get('/subscription')
        return data
    } catch (error) {
        console.error('Error getting subscription info', error)
        return null
    }
}