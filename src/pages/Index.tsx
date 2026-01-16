import { useState } from "react";
import { motion } from "framer-motion";
import { subDays } from "date-fns";
import { Header } from "@/components/dashboard/Header";
import { DataSourceSelector } from "@/components/dashboard/DataSourceSelector";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { FusionControls, getFusionOptions } from "@/components/dashboard/FusionControls";
import { MapCanvas } from "@/components/dashboard/MapCanvas";
import { PixelInspector } from "@/components/dashboard/PixelInspector";
import { 
  ChevronLeft, 
  ChevronRight,
  Download,
  Share2,
  Bookmark,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const initialDataSources = [
  {
    id: 'sentinel-2',
    name: 'Sentinel-2 MSI',
    operator: 'ESA / Copernicus',
    resolution: '10m',
    revisit: '5 days',
    enabled: true,
    color: '#00d4ff',
  },
  {
    id: 'landsat-8',
    name: 'Landsat-8/9 OLI',
    operator: 'NASA / USGS',
    resolution: '30m',
    revisit: '16 days',
    enabled: true,
    color: '#22c55e',
  },
  {
    id: 'resourcesat-2',
    name: 'Resourcesat-2 LISS-III',
    operator: 'ISRO / India',
    resolution: '23.5m',
    revisit: '24 days',
    enabled: false,
    color: '#f97316',
  },
  {
    id: 'cartosat-3',
    name: 'Cartosat-3',
    operator: 'ISRO / India',
    resolution: '0.25m',
    revisit: '5 days',
    enabled: false,
    color: '#8b5cf6',
  },
];

export default function Index() {
  const [dataSources, setDataSources] = useState(initialDataSources);
  const [fusionOptions, setFusionOptions] = useState(getFusionOptions());
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const toggleDataSource = (id: string) => {
    setDataSources(sources =>
      sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const toggleFusionOption = (id: string) => {
    setFusionOptions(options =>
      options.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o)
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <motion.aside
          initial={{ width: 320 }}
          animate={{ width: sidebarCollapsed ? 0 : 320 }}
          className="h-full border-r border-border bg-card/30 overflow-hidden flex-shrink-0"
        >
          <div className="w-80 h-full overflow-y-auto p-4 space-y-6">
            <DataSourceSelector 
              sources={dataSources} 
              onToggle={toggleDataSource} 
            />
            
            <div className="h-px bg-border" />
            
            <TimeRangeSelector
              startDate={dateRange.start}
              endDate={dateRange.end}
              onRangeChange={(start, end) => setDateRange({ start, end })}
            />
            
            <div className="h-px bg-border" />
            
            <FusionControls
              options={fusionOptions}
              onToggle={toggleFusionOption}
            />
          </div>
        </motion.aside>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-full w-6 flex-shrink-0 bg-card/50 hover:bg-muted border-r border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Main Map Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="h-12 border-b border-border bg-card/30 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                ACTIVE SOURCES:
              </span>
              <div className="flex gap-1">
                {dataSources.filter(s => s.enabled).map(source => (
                  <span
                    key={source.id}
                    className="px-2 py-1 rounded text-xs font-mono bg-primary/10 text-primary"
                  >
                    {source.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Save AOI
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Fused
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 p-4">
            <MapCanvas className="w-full h-full" />
          </div>

          {/* Bottom status bar */}
          <div className="h-8 border-t border-border bg-card/30 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>EPSG:3857</span>
              <span>•</span>
              <span>TILES: 24 loaded</span>
              <span>•</span>
              <span>CACHE: 128MB</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">FUSION MODE:</span>
              <span className="text-primary">BROVEY TRANSFORM</span>
            </div>
          </div>
        </div>

        {/* Right panel toggle */}
        <button
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="h-full w-6 flex-shrink-0 bg-card/50 hover:bg-muted border-l border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {rightPanelCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Right Panel - Pixel Inspector */}
        <motion.aside
          initial={{ width: 320 }}
          animate={{ width: rightPanelCollapsed ? 0 : 320 }}
          className="h-full border-l border-border bg-card/30 overflow-hidden flex-shrink-0"
        >
          <div className="w-80 h-full overflow-y-auto p-4 space-y-4">
            <PixelInspector />
            
            {/* Quick actions */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Compute NDVI', desc: 'Vegetation Index' },
                  { label: 'Cloud Mask', desc: 's2cloudless' },
                  { label: 'Pan-Sharpen', desc: 'Brovey Transform' },
                  { label: 'Export GeoTIFF', desc: 'COG Format' },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="w-full p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">
                      {action.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* System stats */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">CPU</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-success"
                      initial={{ width: 0 }}
                      animate={{ width: "23%" }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="text-xs font-mono text-success mt-1">23%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">MEM</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: "67%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <div className="text-xs font-mono text-primary mt-1">67%</div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
