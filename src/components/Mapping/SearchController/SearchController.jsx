import React, { useState, useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";

const SearchControl = ({ setBoundaryData }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', async (result) => {
      const placeName = result.location.label;
      const query = `
        [out:json];
        relation["name"="${placeName}"]["boundary"="administrative"];
        out geom;
      `;

      try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });
        const data = await response.json();
        setBoundaryData(data);
      } catch (error) {
        console.error('Error fetching boundary data:', error);
      }
    });

    return () => map.removeControl(searchControl);
  }, [map, setBoundaryData]);

  return null;
};
