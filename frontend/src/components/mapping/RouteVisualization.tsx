/**
 * RouteVisualization Component
 * 
 * Displays route segments on the map as lines
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { RouteSegment } from '../../services/mappingService';

interface RouteVisualizationProps {
  map: mapboxgl.Map;
  route: RouteSegment[];
  color?: string;
}

const RouteVisualization = ({
  map,
  route,
  color = '#3b82f6',
}: RouteVisualizationProps) => {
  const sourceId = 'route-source';
  const layerId = 'route-layer';

  useEffect(() => {
    if (!map) return;

    // If route is empty, remove existing route
    if (route.length === 0) {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      return;
    }

    // Build GeoJSON line string from route segments
    const coordinates: [number, number][] = [];
    
    route.forEach((segment, index) => {
      if (index === 0) {
        coordinates.push([segment.from.lng, segment.from.lat]);
      }
      coordinates.push([segment.to.lng, segment.to.lat]);
    });

    const geojson = {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates,
      },
      properties: {},
    };

    // Check if source already exists
    const existingSource = map.getSource(sourceId);
    if (existingSource) {
      (existingSource as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      });

      // Add layer
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.7,
        },
      });
    }

    return () => {
      // Cleanup only on unmount
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, route, color]);

  return null; // This component doesn't render anything visible
};

export default RouteVisualization;
