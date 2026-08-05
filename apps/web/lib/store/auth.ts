"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  is_verified: boolean
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: "elowen-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
