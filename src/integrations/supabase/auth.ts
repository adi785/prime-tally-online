import { supabase } from './client'
import { toast } from 'sonner'

export interface AuthUser {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
}

export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Signed in successfully')
    } catch (error) {
      console.error('Sign in error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please check your credentials.'
      toast.error(errorMessage)
      throw error
    }
  },

  async signUp(email: string, password: string, userData?: any): Promise<void> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: userData?.displayName,
            ...userData?.metadata,
          },
        },
      })
      if (error) throw error
      toast.success('Account created successfully')
    } catch (error) {
      console.error('Sign up error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent. Please check your inbox.')
    } catch (error) {
      console.error('Reset password error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      toast.success('Password updated successfully')
    } catch (error) {
      console.error('Update password error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  },

  getCurrentUser(): AuthUser | null {
    const { data: { user } } = supabase.auth.getUser()
    if (!user) return null
    return {
      id: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.display_name,
      avatarUrl: user.user_metadata?.avatar_url,
    }
  },

  isAuthenticated(): boolean {
    const { data: { user } } = supabase.auth.getUser()
    return !!user
  },

  getJWTToken(): string | null {
    const { data } = supabase.auth.getSession()
    return data?.session?.access_token || null
  },
}