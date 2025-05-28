import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSubscriptionInfo } from "@/processes/subscription";

export const useSubscriptionStore = create()(
    persist(
        (set) => ({
            subscriptionInfo: null,
            setSubscriptionInfo: (info: object | null) => set({ subscriptionInfo: info }),
            clearSubscriptionInfo: () => set({ subscriptionInfo: null }),
            fetchSubscriptionInfo: async () => {
                const info = await getSubscriptionInfo()
                set({ subscriptionInfo: info })
            }
        }),
        {
            name: 'subscription-info',
        }
    )
)

