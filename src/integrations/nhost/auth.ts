import { nhost } from './client';
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
      const response = await nhost.auth.signIn({
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.error.message);
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
      const response = await nhost.auth.signUp({
        email,
        password,
        options: {
          displayName: userData?.displayName,
          metadata: userData?.metadata,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Account created successfully');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await nhost.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const response = await nhost.auth.resetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (response.error) {
        throw new Error(response.error.message);
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
      const response = await nhost.auth.updatePassword({
        password: newPassword,
      });

      if (response.error) {
        throw new Error(response.error.message);
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
      const response = await nhost.auth.updateUserProfile({
        displayName: updates.displayName,
        avatarUrl: updates.avatarUrl,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    }
  },

  getCurrentUser(): AuthUser | null {
    const user = nhost.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };
  },

  isAuthenticated(): boolean {
    return nhost.auth.isAuthenticated();
  },

  getJWTToken(): string | null {
    return nhost.auth.getJWTToken();
  },
};