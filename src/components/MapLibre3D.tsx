import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PMTiles, Protocol as PMTilesProtocol } from 'pmtiles';
import type { DestinationWithNotes, Theme } from '../types';

type MapLibre3DProps = {
  destinations: DestinationWithNotes[];
  onSelectDestination: (d: DestinationWithNotes | null) => void;
  selectedDestination: DestinationWithNotes | null;
  theme: Theme;
  onAddPin?: (lat: number, lng: number) => void;
};

// Fallback public style (no API key) with richer labels
// OpenStreetMap-based style with good city labeling
const FALLBACK_STYLE = 'https://tiles.openfreemap.org/styles/osm-bright/style.json';

// Prefer MapTiler styles when a valid key is provided via env
// Set VITE_MAPTILER_KEY in your environment to enable MapTiler styles in production
const MAPTILER_KEY = (import.meta as any).env?.VITE_MAPTILER_KEY as string | undefined;
const MAP_STYLE = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/openstreetmap/style.json?key=${MAPTILER_KEY}`
  : FALLBACK_STYLE;

export function MapLibre3D({ destinations, onSelectDestination, selectedDestination, theme, onAddPin }: MapLibre3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const protocol = new PMTilesProtocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [0, 20],
      zoom: 3,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      projection: 'globe' as any,
      hash: false,
      renderWorldCopies: false,
      maxZoom: 20,
      minZoom: 1,
    });
    mapRef.current = map;

    map.once('load', () => {
      try { (map as any).setProjection && (map as any).setProjection('globe'); } catch {}
      try { 
        map.setFog({ 
          color: theme === 'dark' ? 'rgba(7,10,18,0.95)' : 'rgba(240,245,255,0.95)', 
          'high-color': theme === 'dark' ? '#0b1220' : '#cfe0ff', 
          'space-color': theme === 'dark' ? '#000010' : '#f8fbff',
          'horizon-blend': 0.1
        } as any); 
      } catch {}
      
      // Ensure city labels are visible after a short delay
      setTimeout(() => {
        enhanceLabels();
      }, 1000);
      renderPoints();
    });

    function enhanceLabels() {
      try {
        // Get all layers and enhance text labels
        const layers = map.getStyle().layers;
        console.log('Available layers:', layers.map((l: any) => l.id));
        
        if (layers) {
          layers.forEach((layer: any) => {
            const layerId = layer.id;
            
            // Process all text layers (symbol type with text field)
            if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
              console.log('Enhancing text layer:', layerId);
              
              // Make sure all text layers are visible
              try {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
              } catch (e) {}
              
              // Remove ALL filters that might hide cities at low zoom
              try {
                map.setFilter(layerId, null);
                console.log('Removed all filters for', layerId);
              } catch (e) {}
              
              // Force text to show at all zoom levels with better sizing
              try {
                map.setLayoutProperty(layerId, 'text-size', [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0, 12,
                  1, 12,
                  3, 13,
                  5, 14,
                  8, 15,
                  12, 17,
                  16, 19,
                  20, 22
                ]);
              } catch (e) {}
              
              // Make text more visible
              try {
                map.setPaintProperty(layerId, 'text-color', theme === 'dark' ? '#ffffff' : '#000000');
                map.setPaintProperty(layerId, 'text-halo-color', theme === 'dark' ? '#000000' : '#ffffff');
                map.setPaintProperty(layerId, 'text-halo-width', 2);
              } catch (e) {}
            }
            
            // Also check for any layer with 'place' in the name and make it more visible
            if (layerId.includes('place') || layerId.includes('city') || layerId.includes('town') || layerId.includes('village')) {
              try {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
                map.setFilter(layerId, null);
                console.log('Enhanced place layer:', layerId);
              } catch (e) {}
            }
          });
        }
        
        // Force a repaint
        map.triggerRepaint();
      } catch (e) {
        console.log('Label enhancement failed:', e);
      }
    }

    function renderPoints() {
      if (!map.getSource('destinations')) {
        map.addSource('destinations', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        } as any);
      }
      if (!map.getLayer('dest-glow')) {
        map.addLayer({
          id: 'dest-glow',
          type: 'circle',
          source: 'destinations',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              2, 2,
              6, 8,
              10, 18,
            ],
            'circle-color': [
              'match', ['get', 'category'],
              'dream', '#A78BFA',
              'visited', '#34D399',
              'planning', '#FBBF24',
              '#60a5fa',
            ],
            'circle-opacity': 0.35,
            'circle-blur': 0.6,
          },
        });
      }
      if (!map.getLayer('dest-points')) {
        map.addLayer({
          id: 'dest-points',
          type: 'circle',
          source: 'destinations',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              2, 3,
              6, 6,
              10, 10,
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.5,
            'circle-color': [
              'match', ['get', 'category'],
              'dream', '#A78BFA',
              'visited', '#34D399',
              'planning', '#FBBF24',
              '#60a5fa',
            ],
          },
        });
      }

      updateData();

      map.on('click', 'dest-points', (e) => {
        const f = e.features?.[0] as any;
        if (!f) return;
        const id = f.properties?.id as string;
        const dest = destinations.find((d) => d.id === id) || null;
        if (dest) onSelectDestination(dest);
      });

    }

    function updateData() {
      const features = destinations.map((d) => ({
        type: 'Feature',
        properties: { id: d.id, name: d.name, category: d.category },
        geometry: { type: 'Point', coordinates: [d.longitude, d.latitude] },
      }));
      const src = map.getSource('destinations') as any;
      if (src) src.setData({ type: 'FeatureCollection', features });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  // Theme switch
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(MAP_STYLE);
    mapRef.current.once('styledata', () => {
      try { (mapRef.current as any).setProjection && (mapRef.current as any).setProjection('globe'); } catch {}
      try { 
        mapRef.current!.setFog({ 
          color: theme === 'dark' ? 'rgba(7,10,18,0.95)' : 'rgba(240,245,255,0.95)', 
          'high-color': theme === 'dark' ? '#0b1220' : '#cfe0ff', 
          'space-color': theme === 'dark' ? '#000010' : '#f8fbff',
          'horizon-blend': 0.1
        } as any); 
      } catch {}
      
      // Re-enhance labels after style change
      setTimeout(() => {
        if (mapRef.current) {
          try {
            const layers = mapRef.current.getStyle().layers;
            if (layers) {
              layers.forEach((layer: any) => {
                if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                  mapRef.current!.setLayoutProperty(layer.id, 'visibility', 'visible');
                  mapRef.current!.setFilter(layer.id, null);
                }
              });
            }
          } catch (e) {}
        }
      }, 500);
    });
  }, [theme]);

  // Data update
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const src = map.getSource('destinations') as any;
    if (!src) return;
    const features = destinations.map((d) => ({
      type: 'Feature',
      properties: { id: d.id, name: d.name, category: d.category },
      geometry: { type: 'Point', coordinates: [d.longitude, d.latitude] },
    }));
    src.setData({ type: 'FeatureCollection', features });
  }, [destinations]);

  // Cinematic fly
  useEffect(() => {
    if (!mapRef.current || !selectedDestination) return;
    const map = mapRef.current;
    map.easeTo({ center: [selectedDestination.longitude, selectedDestination.latitude], zoom: 6, duration: 1600, pitch: 55, bearing: -17.6 });
  }, [selectedDestination]);

  // Add pin click handler
  useEffect(() => {
    if (!mapRef.current || !onAddPin) return;
    const map = mapRef.current;
    
    const handleClick = (e: any) => {
      if (isAddingPin) {
        onAddPin(e.lngLat.lat, e.lngLat.lng);
        setIsAddingPin(false);
      }
    };
    
    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [isAddingPin, onAddPin]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden" />
      {onAddPin && (
        <button
          onClick={() => setIsAddingPin(!isAddingPin)}
          className={`absolute top-4 right-4 z-[1000] px-6 py-3 rounded-full font-medium transition-all shadow-lg ${
            isAddingPin 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : theme === 'dark' 
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isAddingPin ? 'Cancel' : '+ Add Pin'}
        </button>
      )}
    </div>
  );
}


