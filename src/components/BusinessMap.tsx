import { useEffect, useRef } from 'react';
import type { Business } from '@/types/types';

// Uzbekistan city coordinates fallback
const CITY_COORDS: Record<string, [number, number]> = {
  'Toshkent':     [41.2995, 69.2401],
  'Samarqand':    [39.6547, 66.9758],
  'Buxoro':       [39.7747, 64.4286],
  'Namangan':     [41.0011, 71.6727],
  'Andijon':      [40.7821, 72.3442],
  "Farg'ona":     [40.3842, 71.7843],
  'Qashqadaryo':  [38.8610, 65.7883],
  'Surxondaryo':  [37.2314, 67.2770],
  'Jizzax':       [40.1158, 67.8422],
  'Sirdaryo':     [40.8393, 68.6610],
  'Navoiy':       [40.0843, 65.3791],
  'Xorazm':       [41.3775, 60.3600],
  "Qoraqalpog'iston": [42.4611, 59.6168],
};

const DEFAULT_CENTER: [number, number] = [41.2995, 69.2401];

interface Props {
  businesses: Business[];
  onSelect?: (b: Business) => void;
}

export default function BusinessMap({ businesses, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let L: typeof import('leaflet');
    let map: import('leaflet').Map;

    (async () => {
      // Dynamic import to avoid SSR issues
      L = (await import('leaflet')).default;

      // Fix Leaflet default icon path issue with bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;
      map = L.map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark tile layer (CartoDB Dark Matter) — matches Mystical theme
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom gold pin icon
      const goldIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;
          background:linear-gradient(135deg,#d4af37,#b8962e);
          border:2px solid #d4af37;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 10px rgba(212,175,55,0.5);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      const vipIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:32px;height:32px;
          background:linear-gradient(135deg,#d4af37,#f0d060);
          border:2px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 0 16px rgba(212,175,55,0.8);
          position:relative;
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
      });

      // Add markers
      businesses.forEach(biz => {
        let lat: number | null = biz.latitude;
        let lng: number | null = biz.longitude;

        // Fallback to region center if no explicit coords
        if (!lat || !lng) {
          const regionCoords = biz.region ? CITY_COORDS[biz.region] : null;
          if (regionCoords) {
            // Small random jitter so overlapping markers separate
            lat = regionCoords[0] + (Math.random() - 0.5) * 0.12;
            lng = regionCoords[1] + (Math.random() - 0.5) * 0.12;
          }
        }

        if (!lat || !lng) return;

        const marker = L.marker([lat, lng], { icon: biz.is_vip ? vipIcon : goldIcon });

        const popup = L.popup({
          maxWidth: 240,
          className: 'mystical-popup',
        }).setContent(`
          <div style="background:#0d1f33;border:1px solid rgba(212,175,55,0.3);border-radius:3px;padding:12px;min-width:180px;font-family:sans-serif;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="width:36px;height:36px;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.3);border-radius:3px;display:flex;align-items:center;justify-content:center;color:#d4af37;font-weight:700;font-size:13px;flex-shrink:0;">
                ${biz.name.slice(0, 2).toUpperCase()}
              </div>
              <div style="min-width:0;">
                <p style="margin:0;color:#e8e4d8;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${biz.name}</p>
                <p style="margin:0;color:#d4af37;font-size:11px;">${biz.category}</p>
              </div>
            </div>
            ${biz.region ? `<p style="margin:0 0 4px;color:#8a8a9a;font-size:11px;">📍 ${biz.region}</p>` : ''}
            ${biz.phone ? `<p style="margin:0 0 4px;color:#8a8a9a;font-size:11px;">📞 ${biz.phone}</p>` : ''}
            ${biz.description ? `<p style="margin:6px 0 0;color:#8a8a9a;font-size:11px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${biz.description}</p>` : ''}
            ${biz.is_vip ? '<span style="display:inline-block;margin-top:6px;background:rgba(212,175,55,0.2);border:1px solid rgba(212,175,55,0.4);color:#d4af37;font-size:9px;padding:2px 8px;letter-spacing:1px;">VIP</span>' : ''}
          </div>
        `);

        marker.bindPopup(popup);
        marker.on('click', () => { if (onSelect) onSelect(biz); });
        marker.addTo(map);
      });

      mapInstanceRef.current = map;
    })();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when businesses change without full re-init
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Just invalidate size in case container resized
    mapInstanceRef.current.invalidateSize();
  }, [businesses]);

  return (
    <div className="relative w-full rounded-sm overflow-hidden border border-border/60"
      style={{ height: 480 }}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Mystical corner overlays */}
      <div className="absolute top-3 left-3 pointer-events-none z-[400]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="2,12 2,2 12,2" stroke="#d4af37" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="12" cy="2" r="1.5" fill="#d4af37" opacity="0.6"/>
          <circle cx="2" cy="12" r="1.5" fill="#d4af37" opacity="0.6"/>
        </svg>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none z-[400]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="22,12 22,2 12,2" stroke="#d4af37" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="12" cy="2" r="1.5" fill="#d4af37" opacity="0.6"/>
          <circle cx="22" cy="12" r="1.5" fill="#d4af37" opacity="0.6"/>
        </svg>
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none z-[400]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="2,12 2,22 12,22" stroke="#d4af37" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="12" cy="22" r="1.5" fill="#d4af37" opacity="0.6"/>
          <circle cx="2" cy="12" r="1.5" fill="#d4af37" opacity="0.6"/>
        </svg>
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none z-[400]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polyline points="22,12 22,22 12,22" stroke="#d4af37" strokeWidth="1.2" opacity="0.6"/>
          <circle cx="12" cy="22" r="1.5" fill="#d4af37" opacity="0.6"/>
          <circle cx="22" cy="12" r="1.5" fill="#d4af37" opacity="0.6"/>
        </svg>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-3 py-1.5 rounded-sm border border-border/40 bg-navy/90 backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
          <span className="text-[10px] text-muted-foreground">Oddiy</span>
        </div>
        <div className="w-px h-3 bg-border/40" />
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)] border border-white/40" />
          <span className="text-[10px] text-muted-foreground">VIP</span>
        </div>
      </div>
    </div>
  );
}
