// frontend/src/store/authStore.js
import { create } from 'zustand'
import { supabase } from '../api/client'

export const useAuthStore = create((set) => ({
  user:    null,
  role:    null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single()
      set({ user: session.user, role: profile?.role || null, loading: false })
    } else {
      set({ user: null, role: null, loading: false })
    }
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        set({ user: session.user, role: profile?.role || null, loading: false })
      } else {
        set({ user: null, role: null, loading: false })
      }
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: null })
  },
}))
