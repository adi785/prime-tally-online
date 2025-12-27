import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useUserSettings, useUpdateUserSettings } from '@/integrations/supabase/hooks'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function Settings() {
  const { data: userSettings, isLoading, error } = useUserSettings();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateUserSettings();

  const [settings, setSettings] = useState({
    notifications: true,
    auto_backup: true,
    dark_mode: false,
    currency: 'INR',
    date_format: 'dd/MM/yyyy',
  });

  useEffect(() => {
    if (userSettings) {
      setSettings({
        notifications: userSettings.notifications,
        auto_backup: userSettings.auto_backup,
        dark_mode: userSettings.dark_mode,
        currency: userSettings.currency,
        date_format: userSettings.date_format,
      });
    }
  }, [userSettings]);

  const handleToggle = (key: keyof typeof settings) => {
    if (!userSettings) {
      toast.error("Error", { description: "User settings not loaded. Please try again." });
      return;
    }
    const newValue = !settings[key];
    setSettings(prev => ({
      ...prev,
      [key]: newValue
    }));
    updateSettings({ id: userSettings.id, [key]: newValue });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userSettings) {
      toast.error("Error", { description: "User settings not loaded. Please try again." });
      return;
    }
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
    updateSettings({ id: userSettings.id, [id]: value });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center py-8">
        <div className="text-destructive mb-4">
          <AlertCircle size={32} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Settings</h3>
        <p className="text-muted-foreground">Failed to load user settings. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for important events</p>
                </div>
                <Switch 
                  checked={settings.notifications} 
                  onCheckedChange={() => handleToggle('notifications')} 
                  disabled={isUpdating}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                </div>
                <Switch 
                  checked={settings.auto_backup} 
                  onCheckedChange={() => handleToggle('auto_backup')} 
                  disabled={isUpdating}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <Switch 
                  checked={settings.dark_mode} 
                  onCheckedChange={() => handleToggle('dark_mode')} 
                  disabled={isUpdating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="max-w-[200px]"
                  disabled={isUpdating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Input
                  id="date_format"
                  value={settings.date_format}
                  onChange={handleChange}
                  className="max-w-[200px]"
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}