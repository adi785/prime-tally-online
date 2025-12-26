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
      const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_NHOST_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('nhost_token', data.access_token);
      localStorage.setItem('nhost_refresh_token', data.refresh_token);

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
      throw error;
    }
  },

  async signUp(email: string, password: string, userData?: any): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_NHOST_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          options: {
            display_name: userData?.displayName,
            ...userData?.metadata,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
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
      const token = localStorage.getItem('nhost_token');
      if (!token) return;

      await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_NHOST_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });

      localStorage.removeItem('nhost_token');
      localStorage.removeItem('nhost_refresh_token');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/auth/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_NHOST_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset email');
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
      const token = localStorage.getItem('nhost_token');
      if (!token) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_NHOST_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
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
      const token = localStorage.getItem('nhost_token');
      if (!token) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_NHOST_BACKEND_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_NHOST_ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    }
  },

  getCurrentUser(): AuthUser | null {
    const token = localStorage.getItem('nhost_token');
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email,
        displayName: payload.user_metadata?.display_name,
        avatarUrl: payload.user_metadata?.avatar_url,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('nhost_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  getJWTToken(): string | null {
    return localStorage.getItem('nhost_token');
  },
};