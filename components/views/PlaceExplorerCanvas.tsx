"use client";

import "@/lib/cesiumBaseUrl";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
import { Entity, LabelGraphics, PointGraphics, Viewer } from "resium";
import { useEffect, useRef } from "react";

const ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
if (ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = ION_TOKEN;
}

const RED = Cesium.Color.fromCssColorString("#ff5a6a");
const WARM = Cesium.Color.fromCssColorString("#ffb066");
const TEXT_BRIGHT = Cesium.Color.fromCssColorString("#eef1f6");

const REGION_HEIGHT = 350_000;
const STREET_HEIGHT = 25_000;
const COUNTRY_HEIGHT = 1_800_000;
const IDLE_ROTATE_SPEED = 0.01;

export interface GlobeMarker {
  name: string;
  lat: number;
  lng: number;
}

export interface NewsHotspot {
  title: string;
  lat: number;
  lng: number;
}

// Plain `Omit<T, K>` over a union collapses to the union's common fields
// only — this distributes the omission over each member instead.
export type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;

export type GlobeCommand =
  | { id: number; type: "goto"; lat: number; lng: number; zoom: "region" | "street" | "country" }
  | { id: number; type: "zoom"; direction: "in" | "out" }
  | { id: number; type: "fit_all"; points: { lat: number; lng: number }[] }
  | { id: number; type: "reset" }
  | { id: number; type: "tour"; places: GlobeMarker[] };

interface PlaceExplorerCanvasProps {
  command: GlobeCommand | null;
  markers: GlobeMarker[];
  newsHotspots: NewsHotspot[];
  idle: boolean;
  dayNight: "night" | "realtime";
}

function heightForZoom(zoom: "region" | "street" | "country"): number {
  if (zoom === "street") return STREET_HEIGHT;
  if (zoom === "country") return COUNTRY_HEIGHT;
  return REGION_HEIGHT;
}

export function PlaceExplorerCanvas({ command, markers, newsHotspots, idle, dayNight }: PlaceExplorerCanvasProps) {
  const viewerRef = useRef<{ cesiumElement?: Cesium.Viewer } | null>(null);
  const isFlyingRef = useRef(false);
  const tourStopRef = useRef<(() => void) | null>(null);
  const nightLayerRef = useRef<Cesium.ImageryLayer | null>(null);

  // One-time scene setup, gated behind the same poll-for-readiness fix
  // needed everywhere Resium's async Viewer construction is used (see
  // WorldGlobeCanvas/CityGlobeCanvas — Cesium.Viewer isn't synchronously
  // available on mount).
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const poll = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement;
      if (!viewer) return;
      clearInterval(poll);

      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#05070e");
      if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
      if (viewer.scene.sun) viewer.scene.sun.show = false;
      if (viewer.scene.moon) viewer.scene.moon.show = false;
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.hueShift = -0.92;
        viewer.scene.skyAtmosphere.saturationShift = -0.2;
        viewer.scene.skyAtmosphere.brightnessShift = -0.35;
      }
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#05070e");

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let lastTime = performance.now();
      const idleRotate = () => {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        if (!isFlyingRef.current && !reducedMotion) {
          viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -IDLE_ROTATE_SPEED * dt);
        }
      };
      viewer.clock.onTick.addEventListener(idleRotate);

      viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(10, 30, 14_000_000) });

      cleanup = () => {
        viewer.clock.onTick.removeEventListener(idleRotate);
      };
    }, 50);

    return () => {
      clearInterval(poll);
      cleanup?.();
    };
  }, []);

  // Night (NASA Black Marble city lights) vs realtime (real sun position,
  // true day/night terminator) imagery toggle.
  useEffect(() => {
    const poll = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement;
      if (!viewer) return;
      clearInterval(poll);

      if (nightLayerRef.current) {
        viewer.imageryLayers.remove(nightLayerRef.current, true);
        nightLayerRef.current = null;
      }

      if (dayNight === "realtime") {
        viewer.scene.globe.enableLighting = true;
        if (viewer.scene.sun) viewer.scene.sun.show = true;
        viewer.clock.shouldAnimate = true;
        const darken = () => {
          for (let i = 0; i < viewer.imageryLayers.length; i++) {
            const layer = viewer.imageryLayers.get(i);
            layer.brightness = 0.7;
            layer.saturation = 0.6;
          }
        };
        darken();
        viewer.imageryLayers.layerAdded.addEventListener(darken);
      } else {
        viewer.scene.globe.enableLighting = false;
        if (viewer.scene.sun) viewer.scene.sun.show = false;
        try {
          const provider = new Cesium.WebMapTileServiceImageryProvider({
            url: "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_CityLights_2012/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg",
            layer: "VIIRS_CityLights_2012",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "500m",
            maximumLevel: 8,
            tilingScheme: new Cesium.GeographicTilingScheme(),
            credit: new Cesium.Credit("NASA EOSDIS GIBS"),
          });
          nightLayerRef.current = viewer.imageryLayers.addImageryProvider(provider);
        } catch (error) {
          console.error("GIBS night-lights layer failed, keeping base imagery dark", error);
          for (let i = 0; i < viewer.imageryLayers.length; i++) {
            const layer = viewer.imageryLayers.get(i);
            layer.brightness = 0.18;
            layer.contrast = 1.35;
            layer.gamma = 0.8;
          }
        }
      }
    }, 50);

    return () => clearInterval(poll);
  }, [dayNight]);

  // Imperative camera commands from PlaceExplorerView.
  useEffect(() => {
    if (!command) return;
    tourStopRef.current?.();
    tourStopRef.current = null;

    const poll = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement;
      if (!viewer) return;
      clearInterval(poll);

      if (command.type === "goto") {
        isFlyingRef.current = true;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(command.lng, command.lat, heightForZoom(command.zoom)),
          duration: 2.2,
          complete: () => {
            isFlyingRef.current = false;
          },
        });
      } else if (command.type === "zoom") {
        const height = viewer.camera.positionCartographic.height;
        const target = command.direction === "in" ? height * 0.45 : height * 2.2;
        const carto = viewer.camera.positionCartographic;
        isFlyingRef.current = true;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, target),
          duration: 1.4,
          complete: () => {
            isFlyingRef.current = false;
          },
        });
      } else if (command.type === "fit_all" && command.points.length > 0) {
        const cartesians = command.points.map((p) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat));
        const sphere = Cesium.BoundingSphere.fromPoints(cartesians);
        sphere.radius = Math.max(sphere.radius * 1.8, 500_000);
        isFlyingRef.current = true;
        viewer.camera.flyToBoundingSphere(sphere, {
          duration: 2.2,
          complete: () => {
            isFlyingRef.current = false;
          },
        });
      } else if (command.type === "reset") {
        isFlyingRef.current = true;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(10, 30, 14_000_000),
          duration: 1.8,
          complete: () => {
            isFlyingRef.current = false;
          },
        });
      } else if (command.type === "tour" && command.places.length > 0) {
        let i = 0;
        let cancelled = false;
        const flyNext = () => {
          if (cancelled) return;
          const place = command.places[i % command.places.length];
          i += 1;
          isFlyingRef.current = true;
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(place.lng, place.lat, REGION_HEIGHT),
            duration: 2,
            complete: () => {
              isFlyingRef.current = false;
            },
          });
        };
        flyNext();
        const interval = setInterval(flyNext, 5000);
        tourStopRef.current = () => {
          cancelled = true;
          clearInterval(interval);
        };
      }
    }, 50);

    return () => clearInterval(poll);
  }, [command]);

  useEffect(() => {
    if (idle) {
      tourStopRef.current?.();
      tourStopRef.current = null;
    }
  }, [idle]);

  return (
    <Viewer
      ref={viewerRef}
      full
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      selectionIndicator={false}
      infoBox={false}
      shadows={false}
    >
      {idle &&
        newsHotspots.slice(0, 15).map((spot, i) => (
          <Entity key={`hotspot-${i}`} position={Cesium.Cartesian3.fromDegrees(spot.lng, spot.lat)} name={spot.title}>
            <PointGraphics
              pixelSize={new Cesium.CallbackProperty(() => 5 + 3 * Math.abs(Math.sin(Date.now() / 700)), false)}
              color={WARM.withAlpha(0.8)}
              outlineColor={WARM}
              outlineWidth={1}
            />
          </Entity>
        ))}

      {markers.map((marker) => (
        <Entity key={marker.name} position={Cesium.Cartesian3.fromDegrees(marker.lng, marker.lat)} name={marker.name}>
          <PointGraphics
            pixelSize={new Cesium.CallbackProperty(() => 14 + 8 * Math.abs(Math.sin(Date.now() / 500)), false)}
            color={RED.withAlpha(0.3)}
            outlineColor={RED}
            outlineWidth={2}
          />
          <LabelGraphics
            text={marker.name}
            font="11px JetBrains Mono, monospace"
            fillColor={TEXT_BRIGHT}
            pixelOffset={new Cesium.Cartesian2(12, 0)}
            horizontalOrigin={Cesium.HorizontalOrigin.LEFT}
            showBackground={false}
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
          />
        </Entity>
      ))}
    </Viewer>
  );
}
