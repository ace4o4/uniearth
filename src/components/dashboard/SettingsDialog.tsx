import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Map as MapIcon, Bell, Shield, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [settings, setSettings] = useState({
        mapLabels: true,
        mapTerrain: true,
        mapAtmosphere: true,
        notificationsEmail: true,
        notificationsPush: false,
        theme: 'dark'
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('fusion-settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handleToggle = (key: string) => (checked: boolean) => {
        const newSettings = { ...settings, [key]: checked };
        setSettings(newSettings);
        localStorage.setItem('fusion-settings', JSON.stringify(newSettings));

        // In a real app, this would trigger a global state update or context
        // For now, we simulate the effect
        if (key.startsWith('map')) {
            toast.info("Map preference updated (reload to apply)");
        }
    };

    const handleClearCache = () => {
        localStorage.removeItem('fusion-settings');
        // Clear other potential caches here
        toast.success("Local cache cleared");
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden h-[500px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your workspace preferences.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="map" className="flex-1 flex flex-col pt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="map">Map</TabsTrigger>
                        <TabsTrigger value="notifications">Alerts</TabsTrigger>
                        <TabsTrigger value="system">System</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto py-4 px-1">
                        {/* MAP SETTINGS */}
                        <TabsContent value="map" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Map Labels</Label>
                                        <p className="text-xs text-muted-foreground">Show city names and borders</p>
                                    </div>
                                    <Switch
                                        checked={settings.mapLabels}
                                        onCheckedChange={handleToggle('mapLabels')}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">3D Terrain</Label>
                                        <p className="text-xs text-muted-foreground">Enable elevation data (DEM)</p>
                                    </div>
                                    <Switch
                                        checked={settings.mapTerrain}
                                        onCheckedChange={handleToggle('mapTerrain')}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Atmosphere</Label>
                                        <p className="text-xs text-muted-foreground">Realistic sky and horizon rendering</p>
                                    </div>
                                    <Switch
                                        checked={settings.mapAtmosphere}
                                        onCheckedChange={handleToggle('mapAtmosphere')}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* NOTIFICATIONS */}
                        <TabsContent value="notifications" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Email Alerts</Label>
                                        <p className="text-xs text-muted-foreground">Receive critical anomaly reports via email</p>
                                    </div>
                                    <Switch
                                        checked={settings.notificationsEmail}
                                        onCheckedChange={handleToggle('notificationsEmail')}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Real-time Events</Label>
                                        <p className="text-xs text-muted-foreground">Show toast notifications for new satellite passes</p>
                                    </div>
                                    <Switch
                                        checked={settings.notificationsPush}
                                        onCheckedChange={handleToggle('notificationsPush')}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* SYSTEM */}
                        <TabsContent value="system" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="rounded-lg border border-border p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span>Security</span>
                                    </div>
                                    <Button variant="outline" className="w-full justify-start text-xs h-9">
                                        Change Password
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start text-xs h-9">
                                        Manage API Keys
                                    </Button>
                                </div>

                                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-red-500">
                                        <Power className="w-4 h-4" />
                                        <span>Danger Zone</span>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={handleClearCache}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear Local Cache & Reload
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="border-t border-border pt-4 flex justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
