import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/integrations/supabase/auth';
import { cn } from '@/lib/utils';

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const isSignup = location.pathname === '/signup';

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (isSignup) {
      if (!formData.displayName) {
        errors.push('Display name is required');
      }

      if (!formData.confirmPassword) {
        errors.push('Confirm password is required');
      } else if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        await authService.signUp(formData.email, formData.password, {
          displayName: formData.displayName,
        });
      } else {
        await authService.signIn(formData.email, formData.password);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      // Error is already handled in authService
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first.');
      return;
    }

    try {
      await authService.resetPassword(formData.email);
    } catch (error) {
      console.error('Password reset error:', error);
      // Error is already handled in authService
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tally-navy to-tally-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-tally-navy">T</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TallyPrime</h1>
          <p className="text-tally-navy-light text-sm">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-gray-50 border-gray-200 focus:border-tally-blue focus:ring-tally-blue"
                disabled={isLoading}
              />
            </div>

            {/* Display Name (Signup only) */}
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  required
                  className="bg-gray-50 border-gray-200 focus:border-tally-blue focus:ring-tally-blue"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="bg-gray-50 border-gray-200 focus:border-tally-blue focus:ring-tally-blue"
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password (Signup only) */}
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="bg-gray-50 border-gray-200 focus:border-tally-blue focus:ring-tally-blue"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Forgot Password (Login only) */}
            {!isSignup && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-tally-blue hover:text-tally-blue/80 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-tally-blue hover:bg-tally-blue/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isSignup ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {/* Switch Auth Type */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => navigate(isSignup ? '/login' : '/signup')}
                className="ml-2 text-tally-blue hover:text-tally-blue/80 font-medium transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-tally-navy-light text-xs">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}