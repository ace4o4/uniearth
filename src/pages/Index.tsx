import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subDays } from "date-fns";
import { Header } from "@/components/dashboard/Header";
import { DataSourceSelector } from "@/components/dashboard/DataSourceSelector";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { FusionControls, getFusionOptions } from "@/components/dashboard/FusionControls";
import { MapCanvas } from "@/components/dashboard/MapCanvas";
import { RealPixelInspector } from "@/components/dashboard/RealPixelInspector";
import { CompositeSelector } from "@/components/dashboard/CompositeSelector";
import { BandComposite, composites } from "@/lib/constants";
import { SystemLog, LogEntry } from "@/components/dashboard/SystemLog";
import { LocationInfoCard } from "@/components/dashboard/LocationInfoCard";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ResizableWindow } from "@/components/ui/ResizableWindow";
import { PopoutWindow } from "@/components/ui/PopoutWindow";
import { 
  ChevronLeft, 
  ChevronRight,
  Download,
  Share2,
  Bookmark,
  HelpCircle,
  Database,
  Calendar,
  Layers,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { FlightAnimation } from "@/components/ui/FlightAnimation";

interface PixelLocation {
  lat: number;
  lon: number;
}

const initialDataSources = [
  {
    id: 'sentinel-2',
    name: 'Sentinel-2 MSI',
    operator: 'ESA / Copernicus',
    resolution: '10m',
    revisit: '5 days',
    enabled: true,
    color: '#00d4ff',
    bestFor: 'Agriculture',
    description: 'High revisit frequency ideal for vegetation monitoring.',
  },
  {
    id: 'landsat-8',
    name: 'Landsat-8/9 OLI',
    operator: 'NASA / USGS',
    resolution: '30m',
    revisit: '16 days',
    enabled: true,
    color: '#22c55e',
    bestFor: 'Thermal / Trends',
    description: 'Historical data analysis and land surface temperature.',
  },
  {
    id: 'resourcesat-2',
    name: 'Resourcesat-2 LISS-III',
    operator: 'ISRO / India',
    resolution: '23.5m',
    revisit: '24 days',
    enabled: false,
    color: '#f97316',
    bestFor: 'Regional Planning',
    description: 'Wide swath optimized for Indian terrain mapping.',
  },
  {
    id: 'cartosat-3',
    name: 'Cartosat-3',
    operator: 'ISRO / India',
    resolution: '0.25m',
    revisit: '5 days',
    enabled: false,
    color: '#8b5cf6',
    bestFor: 'Infrastructure',
    description: 'Sub-meter resolution for urban and road mapping.',
  },
];

export default function Index() {
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState(initialDataSources);
  const [fusionOptions, setFusionOptions] = useState(getFusionOptions());
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [selectedComposite, setSelectedComposite] = useState<BandComposite>(composites[0]);
  const [pixelLocation, setPixelLocation] = useState<PixelLocation | null>(null);
  const [isLoadingPixel, setIsLoadingPixel] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogPoppedOut, setIsLogPoppedOut] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{lat: number, lon: number, zoom?: number, geojson?: any} | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store STAC items
  
  // Flight Animation State
  const [flightParams, setFlightParams] = useState<{
    isActive: boolean;
    startRect: DOMRect | null;
    destinationName: string;
  }>({ isActive: false, startRect: null, destinationName: "" });

  const [activeLocationInfo, setActiveLocationInfo] = useState<{
    name: string;
    lat: number;
    lon: number;
    bbox?: number[];
  } | null>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: new Date(),
      message,
      type
    }]);
  };

  const toggleDataSource = (id: string) => {
    setDataSources(sources =>
      sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
    
    // Toast feedback and Log
    const source = dataSources.find(s => s.id === id);
    if (source) {
       const status = !source.enabled ? "ACTIVATED" : "DEACTIVATED";
       addLog(`Source ${source.id} ${status}`, !source.enabled ? 'success' : 'warning');
       toast({
         title: source.enabled ? "Layer Disabled" : "Layer Enabled",
         description: `${source.name} is now ${source.enabled ? "off" : "active"}.`,
       });
    }
  };

  const toggleFusionOption = async (id: string) => {
    // 1. Optimistic Update or Wait? Let's Wait to simulate "Real Time Connection"
    const option = fusionOptions.find(o => o.id === id);
    if (!option) return;

    const newValue = !option.enabled;
    const actionName = option.label;

    // Notify User - Processing Started
    toast({ title: "Processing Request...", description: `Sending ${actionName} command to Satellite Core.` });
    addLog(`TRANSMITTING COMMAND: ${actionName.toUpperCase()} -> ${newValue ? 'ON' : 'OFF'}`, 'warning');

    try {
        // 2. Call Backend Simulation
        if (newValue) {
             const res = await api.processFusion(id);
             if (res.status === 'success') {
                 addLog(`SERVER RESPONSE: ${res.message}`, 'success');
                 toast({ title: "Fusion Complete", description: res.message });
             }
        } else {
             addLog(`MODULE DEACTIVATED: ${actionName}`, 'info');
        }

        // 3. Update State (This triggers the Visual Change in MapCanvas)
        setFusionOptions(options =>
          options.map(o => o.id === id ? { ...o, enabled: newValue } : o)
        );

    } catch (e) {
        addLog(`CONNECTION ERROR: Failed to toggle ${actionName}`, 'error');
        toast({ title: "Error", description: "Backend connection failed. Check console." });
    }
  };

  const handleCompositeSelect = (composite: BandComposite) => {
    setSelectedComposite(composite);
    addLog(`Switched composite to ${composite.name.toUpperCase()}`, 'info');
    addLog(`Applying spectral filters: R=${composite.bands.red} G=${composite.bands.green} B=${composite.bands.blue}`, 'info');
  };

  const handlePixelClick = useCallback((location: PixelLocation) => {
    setIsLoadingPixel(true);
    setPixelLocation(location);
    addLog(`Inspecting Pixel: [${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}]`, 'info');
    // Simulate data fetch
    setTimeout(() => {
        setIsLoadingPixel(false);
        addLog(`Pixel Spectral Data Retrieved: Success`, 'success');
    }, 300);
  }, []);

  const handleQuickAction = async (action: string) => {
      addLog(`Initiating Action: ${action}`, 'info');
      toast({ title: "Processing...", description: `Initiating ${action} pipeline...` });
      
      try {
          if (action === "Process-Fusion") {
              addLog("Connecting to Fusion Engine...", 'info');
              const res = await api.fuse("sar-optical", "sentinel-2", "sentinel-1");
              if (res.status === 'success') {
                  addLog("Fusion Pipeline Completed Successfully", 'success');
                  toast({ title: "Success", description: "Fusion pipeline completed successfully." });
              } else {
                  throw new Error(res.message);
              }
          } else {
               // Simulate others
               addLog(`Allocating resources for ${action}...`, 'info');
               setTimeout(() => {
                   addLog(`${action} Task Completed. Result stored in cache.`, 'success');
                   toast({ title: "Analysis Complete", description: `${action} generated successfully.` });
               }, 1500);
          }
      } catch (e) {
          addLog(`Action Failed: ${action}`, 'error');
          toast({ variant: "destructive", title: "Error", description: "Failed to execute action." });
      }
  };

  const mainRef = useRef(null);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans selection:bg-primary/20">
      <FlightAnimation 
        isActive={flightParams.isActive}
        startRect={flightParams.startRect}
        destinationName={flightParams.destinationName}
        onComplete={() => setFlightParams(prev => ({ ...prev, isActive: false }))}
      />

      <Header 
        // ... previous props
        onLocationSelect={(lat, lon, zoom, startRect, name, geojson, bbox) => {
           // Prevent double-flight if already flying
           if (flightParams.isActive) return;

           setFlyToLocation({ lat, lon, zoom: zoom || 11, geojson }); // Ensure final zoom is 11 as requested
           
           // Flight Triggered
           if (startRect) {
             // 1. Clear Info Card
             setActiveLocationInfo(null);
             
             // 2. Start Animation
             setFlightParams({
               isActive: true,
               startRect,
               destinationName: name || "Unknown Location"
             });

             // 3. Log Flight Initiation
             addLog(`TARGET LOCKED: ${name?.toUpperCase()}`, 'info');
             addLog(`INITIATING FLIGHT SEQUENCE TO [${lat.toFixed(3)}, ${lon.toFixed(3)}]`, 'warning');

             // 4. Wait for land (3s) to show info
             setTimeout(() => {
                // Check if we are still active (handling race conditions)
                setFlightParams(prev => {
                    if (!prev.isActive) return prev; 
                    return { ...prev, isActive: false }; // Flight done
                });

                addLog(`DESTINATION REACHED: ${name?.toUpperCase()}`, 'success');
                addLog(`ENGAGING FUSION SENSORS...`, 'info');
                
                // Parse bbox if available
                let parsedBbox: number[] | undefined = undefined;
                if (bbox) {
                    parsedBbox = bbox.map(parseFloat);
                } else if (geojson?.bbox) {
                    parsedBbox = geojson.bbox;
                }

                 // Show Info Card
                setActiveLocationInfo({
                   name: name || "Unknown",
                   lat,
                   lon,
                   bbox: parsedBbox
                });

             }, 3000);

             // 4. TRIGGER REAL STAC SEARCH (Phase 2B Integration)
             // Parse bbox: Nominatim gives [minLat, maxLat, minLon, maxLon] strings
             // STAC needs: [minLon, minLat, maxLon, maxLat] floats
             let searchBbox: number[] = [];
             if (bbox && bbox.length === 4) {
                 const b = bbox.map(parseFloat);
                 // Swap: [lat1, lat2, lon1, lon2] -> [lon1, lat1, lon2, lat2]
                 searchBbox = [b[2], b[0], b[3], b[1]]; 
             } else {
                 searchBbox = [lon - 0.1, lat - 0.1, lon + 0.1, lat + 0.1];
             }

             // Trigger Search
             api.search("sentinel-2", searchBbox, "2024-01-01", new Date().toISOString().split('T')[0])
                .then(res => {
                     if (res.results && res.results.length > 0) {
                         const count = res.results.length;
                         // Delayed log to appear after landing
                         setTimeout(() => {
                            setSearchResults(res.results); // Visualize on Map
                            addLog(`SCAN COMPLETE: FOUND ${count} LIVE SCENES`, "success");
                            toast({ 
                                title: "Data Found", 
                                description: `${count} Sentinel-2/Landsat scenes found locally.` 
                            });
                         }, 3200);
                     } else {
                         setTimeout(() => {
                           setSearchResults([]); // Clear old results
                           addLog("SCAN COMPLETE: NO RECENT PASSES FOUND", "info");
                         }, 3200);
                     }
                })
                .catch(err => {
                    setTimeout(() => addLog("SCAN ERROR: CONNECTION FAILED", "error"), 3200);
                });
           } else {
              // Direct Fly (no animation)
              let parsedBbox: number[] | undefined = undefined;
              if (bbox) parsedBbox = bbox.map(parseFloat);
              
              setActiveLocationInfo({ name: name || "Unknown", lat, lon, bbox: parsedBbox });
              addLog(`JUMP CUT TO: ${name?.toUpperCase()}`, 'info');
           }
        }}
        onAuthSuccess={(user) => {
            // setIsAuthOpen(false) handled in Header mostly or passed down.
            // Actually Header handles state internally for auth dialog, but parent might want to know.
            addLog(`USER AUTHENTICATED: ${user.name.toUpperCase()}`, 'success');
        }}
      />
      
      <main ref={mainRef} className="flex-1 overflow-hidden relative">
        {/* Location Info Card Overlay */}
        <AnimatePresence>
           {activeLocationInfo && (
              <LocationInfoCard 
                 {...activeLocationInfo} 
                 containerRef={mainRef}
                 onClose={() => setActiveLocationInfo(null)}
              />
           )}
        </AnimatePresence>

        <ResizablePanelGroup direction="horizontal">
          
          {/* LEFT SIDEBAR */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card/30 backdrop-blur-md border-r border-border">
            <div className="h-full flex flex-col overflow-y-auto p-4 space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">DATA SOURCES</h2>
                  </div>
                  <DataSourceSelector 
                    sources={dataSources}
                    onToggle={toggleDataSource}
                  />
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">TIME RANGE</h2>
                  </div>
                  <TimeRangeSelector 
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onRangeChange={(start, end) => setDateRange({ start, end })}
                  />
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">BAND COMPOSITES</h2>
                  </div>
                  <CompositeSelector
                    selectedComposite={selectedComposite.id}
                    onSelect={handleCompositeSelect}
                  />
                  
                  <div className="h-px bg-border mt-4 mb-4" />
                  
                  <FusionControls 
                    options={fusionOptions}
                    onToggle={toggleFusionOption}
                  />
                </section>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* MAIN MAP AREA */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full relative p-4 bg-background/50 flex flex-col">
               {/* Toolbar */}
              <div className="h-12 border-b border-border bg-card/30 px-4 flex items-center justify-between mb-4 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    ACTIVE:
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
                  <div className="w-px h-4 bg-border mx-2" />
                  <span className="text-xs font-mono text-muted-foreground">
                    MODE:
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-mono bg-success/10 text-success">
                    {selectedComposite.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                      onClick={() => toast({ title: "Feature Saved", description: "Area of Interest saved to profile." })}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Save AOI
                  </button>
                  <button 
                      onClick={() => toast({ title: "Link Copied", description: "Dashboard link copied to clipboard." })}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button 
                      onClick={() => handleQuickAction("Process-Fusion")}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Fused
                  </button>
                </div>
              </div>

              <div className="flex-1 relative rounded-xl overflow-hidden shadow-2xl border border-border">
                <MapCanvas 
                  className="w-full h-full" 
                  selectedComposite={selectedComposite}
                  onPixelClick={handlePixelClick}
                  dataSources={dataSources}
                  flyToLocation={flyToLocation}
                  fusionOptions={fusionOptions}
                  searchResults={searchResults}
                />

                {/* Float Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-xl z-10">
                  <button 
                    onClick={() => setDateRange(prev => ({ ...prev, start: subDays(prev.start, 1) }))}
                    className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-xs font-mono font-medium">
                    {dateRange.end.toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => setDateRange(prev => ({ ...prev, end: new Date() }))}
                    className="p-1 hover:bg-primary/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* RIGHT SIDEBAR */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35} className="bg-card/30 backdrop-blur-md border-l border-border">
             <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
                <RealPixelInspector 
                  isLoading={isLoadingPixel}
                  location={pixelLocation}
                />
                
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" /> Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                     {['Save AOI', 'Share', 'Export Fused', 'Process-Fusion'].map(action => (
                       <button
                         key={action}
                         onClick={() => handleQuickAction(action)}
                         className="px-3 py-2 rounded-md bg-muted/50 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 text-xs font-medium transition-all"
                       >
                         {action}
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

                {/* DOCKED SYSTEM LOGS (Visible if not popped out) */}
                {!isLogPoppedOut && (
                  <SystemLog 
                    logs={logs} 
                    className="flex-1 min-h-[150px]" 
                    onPopOut={() => setIsLogPoppedOut(true)}
                  />
                )}

             </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* POPPED OUT SYSTEM LOGS */}
      {isLogPoppedOut && (
        <PopoutWindow 
          title="SYSTEM TERMINAL - EXTERNAL" 
          onClose={() => setIsLogPoppedOut(false)}
        >
           <SystemLog logs={logs} className="h-full border-none rounded-none" />
        </PopoutWindow>
      )}

    </div>
  );
}
