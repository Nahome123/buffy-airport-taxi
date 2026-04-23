import "server-only";

import { getMapboxAccessToken } from "@/lib/env";

const METERS_PER_MILE = 1609.344;
const BASE_FARE_CENTS = 1000;
const CENTS_PER_MILE = 200;

type GeocodingResponse = {
  features?: Array<{
    mapbox_id?: string;
    name?: string;
    full_address?: string;
    place_formatted?: string;
    properties?: {
      mapbox_id?: string;
      name?: string;
      full_address?: string;
      place_formatted?: string;
    };
    geometry?: {
      coordinates?: [number, number];
    };
  }>;
};

type DirectionsResponse = {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: string;
  }>;
};

function getRoutingToken() {
  const token = getMapboxAccessToken();

  if (!token) {
    throw new Error("Missing required environment variable: MAPBOX_ACCESS_TOKEN");
  }

  return token;
}

async function geocodeAddress(address: string) {
  const token = getRoutingToken();
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");

  url.searchParams.set("q", address);
  url.searchParams.set("limit", "1");
  url.searchParams.set("access_token", token);
  url.searchParams.set("autocomplete", "true");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const data = (await response.json()) as GeocodingResponse;
  const coordinates = data.features?.[0]?.geometry?.coordinates;

  if (!coordinates || coordinates.length !== 2) {
    throw new Error("Could not find coordinates for one of the addresses.");
  }

  return coordinates;
}

export async function getAddressSuggestions(query: string) {
  const token = getRoutingToken();
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");

  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("access_token", token);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("country", "US");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Address suggestions failed with status ${response.status}`);
  }

  const data = (await response.json()) as GeocodingResponse;

  return (data.features ?? [])
    .map((feature) => {
      const mapboxId =
        feature.properties?.mapbox_id ?? feature.mapbox_id ?? crypto.randomUUID();
      const fullAddress =
        feature.properties?.full_address ?? feature.full_address ?? null;
      const name = feature.properties?.name ?? feature.name ?? null;
      const placeFormatted =
        feature.properties?.place_formatted ?? feature.place_formatted ?? null;
      const label = fullAddress ?? [name, placeFormatted].filter(Boolean).join(", ");

      return {
        id: mapboxId,
        label,
      };
    })
    .filter((suggestion) => suggestion.label.length > 0);
}

export async function getMileageEstimate(
  pickupAddress: string,
  dropoffAddress: string,
) {
  const token = getRoutingToken();
  const [pickupCoordinates, dropoffCoordinates] = await Promise.all([
    geocodeAddress(pickupAddress),
    geocodeAddress(dropoffAddress),
  ]);

  const coordinates = `${pickupCoordinates[0]},${pickupCoordinates[1]};${dropoffCoordinates[0]},${dropoffCoordinates[1]}`;

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("overview", "false");
  url.searchParams.set("geometries", "polyline");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Routing failed with status ${response.status}`);
  }

  const data = (await response.json()) as DirectionsResponse;
  const distanceMeters = data.routes?.[0]?.distance;
  const durationSeconds = data.routes?.[0]?.duration;
  const routeGeometry = data.routes?.[0]?.geometry;

  if (!distanceMeters || distanceMeters <= 0) {
    throw new Error("Could not calculate the route distance.");
  }

  const distanceMiles = distanceMeters / METERS_PER_MILE;
  const fareCents = BASE_FARE_CENTS + Math.round(distanceMiles * CENTS_PER_MILE);
  const overlays = [
    routeGeometry
      ? `path-5+8b4513-0.75(${encodeURIComponent(routeGeometry)})`
      : null,
    `pin-s-a+1f6f8b(${pickupCoordinates[0]},${pickupCoordinates[1]})`,
    `pin-s-b+b6461e(${dropoffCoordinates[0]},${dropoffCoordinates[1]})`,
  ]
    .filter(Boolean)
    .join(",");

  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${overlays}/auto/900x420?padding=60&access_token=${token}`;

  return {
    distanceMiles,
    durationMinutes: durationSeconds ? Math.round(durationSeconds / 60) : null,
    fareCents,
    staticMapUrl,
  };
}
