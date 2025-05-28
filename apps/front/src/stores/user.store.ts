import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserInfo {
  id: string
  email: string
  name: string
  phone_number: string
  document: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  cep: string
  isAdmin: boolean
  request_value: number
  permissions: {
    id: string
    name: string
    module: string
  }[]
  team: {
    name: string
  }
}

interface UserState {
  userInfo: UserInfo | null
  setUserInfo: (userInfo: UserInfo) => void
  clearUserInfo: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,

      setUserInfo: (userInfo) =>
        set({
          userInfo,
        }),

      clearUserInfo: () =>
        set({
          userInfo: null,
        }),
    }),
    {
      name: 'user-storage'
    }
  )
)
