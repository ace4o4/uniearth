import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, Globe, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
}

const ROLES = [
    "Agricultural Scientist",
    "Urban Planner",
    "Environmental Analyst",
    "Disaster Response Coordinator",
    "Data Scientist",
    "General User"
];

export function ProfileDialog({ open, onOpenChange, user }: ProfileDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        organization: '',
        role: '',
        aoi: '', // Stores coordinates as string for now
    });

    // Load user data when dialog opens
    useEffect(() => {
        if (open && user) {
            setFormData({
                name: user.name || '',
                organization: user.email?.split('@')[1] || '', // Fallback to domain
                role: 'General User', // Default
                aoi: '',
            });

            // Fetch latest metadata
            const fetchProfile = async () => {
                const { data: { user: latestUser } } = await supabase.auth.getUser();
                if (latestUser?.user_metadata) {
                    setFormData({
                        name: latestUser.user_metadata.full_name || '',
                        organization: latestUser.user_metadata.organization || '',
                        role: latestUser.user_metadata.role || 'General User',
                        aoi: latestUser.user_metadata.default_aoi || '',
                    });
                }
            };
            fetchProfile();
        }
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.name,
                    organization: formData.organization,
                    role: formData.role,
                    default_aoi: formData.aoi,
                }
            });

            if (error) throw error;
            toast.success('Profile updated successfully');
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        User Profile
                    </DialogTitle>
                    <DialogDescription>
                        Manage your professional details and preferences for the Fusion Agent.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-mono text-muted-foreground">FULL NAME</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                className="pl-10"
                                placeholder="Dr. Jane Doe"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-mono text-muted-foreground">ROLE / SPECIALIZATION</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                        >
                            <SelectTrigger className="w-full pl-10 relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Organization */}
                    <div className="space-y-2">
                        <Label htmlFor="org" className="text-xs font-mono text-muted-foreground">ORGANIZATION</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="org"
                                value={formData.organization}
                                onChange={handleInputChange('organization')}
                                className="pl-10"
                                placeholder="Organization Name"
                            />
                        </div>
                    </div>

                    {/* Default AOI */}
                    <div className="space-y-2">
                        <Label htmlFor="aoi" className="text-xs font-mono text-muted-foreground">DEFAULT AOI (LAT, LON)</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="aoi"
                                value={formData.aoi}
                                onChange={handleInputChange('aoi')}
                                className="pl-10"
                                placeholder="e.g., 20.5937, 78.9629"
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Used by the Agent to automatically focus analyses when no location is specified.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}
