// frontend/src/store/authStore.js
import { create } from 'zustand'
import { supabase } from '../api/client'

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,

  setUser: (user, role) => set({ user, role, loading: false }),
  clearUser: () => set({ user: null, role: null, loading: false }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: null, loading: false })
  },

  initialize: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single()

      set({ user: session.user, role: profile?.role ?? null, loading: false })
    } else {
      set({ user: null, role: null, loading: false })
    }

    // Listen for auth changes (login/logout)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, role: profile?.role ?? null, loading: false })
      } else {
        set({ user: null, role: null, loading: false })
      }
    })
  }
}))