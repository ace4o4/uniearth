import { Palette, Eye, Leaf, Building2, Droplets, Flame } from "lucide-react";

export interface BandComposite {
  id: string;
  name: string;
  description: string;
  bands: { red: string; green: string; blue: string };
  icon: React.ReactNode;
  color: string;
}

export const composites: BandComposite[] = [
  {
    id: 'true-color',
    name: 'True Color',
    description: 'Natural RGB view',
    bands: { red: 'B04', green: 'B03', blue: 'B02' },
    icon: <Eye className="w-4 h-4" />,
    color: 'hsl(var(--primary))',
  },
  {
    id: 'false-color-nir',
    name: 'False Color (NIR)',
    description: 'Vegetation emphasis',
    bands: { red: 'B08', green: 'B04', blue: 'B03' },
    icon: <Palette className="w-4 h-4" />,
    color: 'hsl(var(--success))',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'NIR-Red-Green composite',
    bands: { red: 'B08', green: 'B04', blue: 'B03' },
    icon: <Leaf className="w-4 h-4" />,
    color: '#22c55e',
  },
  {
    id: 'urban',
    name: 'Urban',
    description: 'SWIR-NIR-Red composite',
    bands: { red: 'B12', green: 'B08', blue: 'B04' },
    icon: <Building2 className="w-4 h-4" />,
    color: '#8b5cf6',
  },
  {
    id: 'moisture',
    name: 'Moisture Index',
    description: 'Water content analysis',
    bands: { red: 'B8A', green: 'B11', blue: 'B04' },
    icon: <Droplets className="w-4 h-4" />,
    color: '#3b82f6',
  },
  {
    id: 'geology',
    name: 'Geology',
    description: 'SWIR bands for minerals',
    bands: { red: 'B12', green: 'B11', blue: 'B02' },
    icon: <Flame className="w-4 h-4" />,
    color: '#f97316',
  },
];
