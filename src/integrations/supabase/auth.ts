import { supabase } from './client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      throw error;
    }
  },

  async signUp(email: string, password: string, userData?: any): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user?.confirmed_at) {
        toast.success('Account created successfully');
      } else {
        toast.success('Account created! Please check your email to confirm your account.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email. Please try again.');
      throw error;
    }
  },

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Update password error:', error);
      toast.error('Failed to update password. Please try again.');
      throw error;
    }
  },

  async updateProfile(updates: Partial<AuthUser>): Promise<void> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    }
  },

  getCurrentUser(): AuthUser | null {
    const user = supabase.auth.getUser().data.user;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.displayName,
      avatarUrl: user.user_metadata?.avatarUrl,
    };
  },

  isAuthenticated(): boolean {
    const session = supabase.auth.getSession().data.session;
    return !!session;
  },

  getJWTToken(): string | null {
    const session = supabase.auth.getSession().data.session;
    return session?.access_token || null;
  },

  async confirmEmail(tokenHash: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash: tokenHash,
      });

      if (error) {
        throw error;
      }

      toast.success('Email confirmed successfully');
    } catch (error) {
      console.error('Email confirmation error:', error);
      toast.error('Failed to confirm email. Please try again.');
      throw error;
    }
  },

  async resendConfirmationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      toast.success('Confirmation email sent. Please check your inbox.');
    } catch (error) {
      console.error('Resend confirmation error:', error);
      toast.error('Failed to resend confirmation email. Please try again.');
      throw error;
    }
  },

  async changeEmail(newEmail: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        throw error;
      }

      toast.success('Email update request sent. Please check your new email to confirm.');
    } catch (error) {
      console.error('Change email error:', error);
      toast.error('Failed to update email. Please try again.');
      throw error;
    }
  },
};