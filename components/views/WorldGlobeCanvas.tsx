"use client";

import "@/lib/cesiumBaseUrl";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
import { Entity, LabelGraphics, PointGraphics, PolylineGraphics, Viewer } from "resium";
import { useEffect, useRef } from "react";
import { CITIES } from "@/lib/cities";

const ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
if (ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = ION_TOKEN;
}

const ORANGE = Cesium.Color.fromCssColorString("#FF6B1A");
const ORANGE_BRIGHT = Cesium.Color.fromCssColorString("#FF4500");
const TEXT_BRIGHT = Cesium.Color.fromCssColorString("#E8E8EC");
const YELLOW = Cesium.Color.fromCssColorString("#FFD23F");

// Decorative "satellite link" arcs between a few cities — not real network data.
const ARC_PAIRS: [string, string][] = [
  ["Berlin", "Tokyo"],
  ["Stockholm", "Paris"],
  ["London", "Moscow"],
  ["Trier", "London"],
];

export interface FlyToRequest {
  lat: number;
  lng: number;
  requestId: number;
}

interface WorldGlobeCanvasProps {
  highlightLat: number;
  highlightLng: number;
  flyToRequest: FlyToRequest | null;
}

// Loaded via next/dynamic(ssr:false) from WorldGlobeView, which does not
// reliably forward refs through to a lazily-loaded component — flyTo is
// requested via the flyToRequest prop instead of an imperative ref handle.
export function WorldGlobeCanvas({ highlightLat, highlightLng, flyToRequest }: WorldGlobeCanvasProps) {
  // Resium constructs the underlying Cesium.Viewer asynchronously (deferred
  // via microtask, to support Suspense-style async resource loading), so
  // viewerRef.current?.cesiumElement is NOT guaranteed to exist yet in a
  // plain useEffect(() => {...}, []) right after mount. Everything below
  // polls for it instead of assuming it's ready synchronously.
  const viewerRef = useRef<{ cesiumElement?: Cesium.Viewer } | null>(null);
  const isFlyingRef = useRef(false);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const poll = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement;
      if (!viewer) return;
      clearInterval(poll);

      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#05050a");
      if (viewer.scene.skyAtmosphere) {
        viewer.scene.skyAtmosphere.hueShift = -0.92;
        viewer.scene.skyAtmosphere.saturationShift = -0.2;
        viewer.scene.skyAtmosphere.brightnessShift = -0.35;
      }
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0A0A0C");
      if (viewer.scene.skyBox) viewer.scene.skyBox.show = false;
      if (viewer.scene.sun) viewer.scene.sun.show = false;
      if (viewer.scene.moon) viewer.scene.moon.show = false;

      const darkenLayers = () => {
        for (let i = 0; i < viewer.imageryLayers.length; i++) {
          const layer = viewer.imageryLayers.get(i);
          layer.brightness = 0.18;
          layer.contrast = 1.35;
          layer.saturation = 0.35;
          layer.gamma = 0.8;
        }
      };
      darkenLayers();
      viewer.imageryLayers.layerAdded.addEventListener(darkenLayers);

      let lastTime = performance.now();
      const idleRotate = () => {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        if (!isFlyingRef.current) {
          viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.015 * dt);
        }
      };
      viewer.clock.onTick.addEventListener(idleRotate);

      cleanup = () => {
        viewer.imageryLayers.layerAdded.removeEventListener(darkenLayers);
        viewer.clock.onTick.removeEventListener(idleRotate);
      };
    }, 50);

    return () => {
      clearInterval(poll);
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    if (!flyToRequest) return;

    const poll = setInterval(() => {
      const viewer = viewerRef.current?.cesiumElement;
      if (!viewer) return;
      clearInterval(poll);

      isFlyingRef.current = true;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(flyToRequest.lng, flyToRequest.lat, 6_000_000),
        duration: 2.4,
        complete: () => {
          isFlyingRef.current = false;
        },
      });
    }, 50);

    return () => clearInterval(poll);
  }, [flyToRequest]);

  const cityByName = (name: string) => CITIES.find((c) => c.name === name);

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
      {CITIES.map((city) => (
        <Entity key={city.name} position={Cesium.Cartesian3.fromDegrees(city.lng, city.lat)} name={city.name}>
          <PointGraphics
            pixelSize={new Cesium.CallbackProperty(() => 5 + 3 * Math.abs(Math.sin(Date.now() / 600)), false)}
            color={ORANGE}
            outlineColor={ORANGE_BRIGHT}
            outlineWidth={1}
          />
          <LabelGraphics
            text={city.name}
            font="10px JetBrains Mono, monospace"
            fillColor={TEXT_BRIGHT}
            pixelOffset={new Cesium.Cartesian2(10, 0)}
            horizontalOrigin={Cesium.HorizontalOrigin.LEFT}
            showBackground={false}
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
          />
        </Entity>
      ))}

      {ARC_PAIRS.map(([fromName, toName]) => {
        const from = cityByName(fromName);
        const to = cityByName(toName);
        if (!from || !to) return null;
        return (
          <Entity key={`${fromName}-${toName}`}>
            <PolylineGraphics
              positions={Cesium.Cartesian3.fromDegreesArray([from.lng, from.lat, to.lng, to.lat])}
              width={1.5}
              arcType={Cesium.ArcType.GEODESIC}
              material={
                new Cesium.PolylineGlowMaterialProperty({
                  color: YELLOW,
                  glowPower: new Cesium.CallbackProperty(
                    () => 0.15 + 0.1 * Math.abs(Math.sin(Date.now() / 900)),
                    false
                  ),
                })
              }
            />
          </Entity>
        );
      })}

      <Entity position={Cesium.Cartesian3.fromDegrees(highlightLng, highlightLat)}>
        <PointGraphics
          pixelSize={new Cesium.CallbackProperty(() => 14 + 10 * Math.abs(Math.sin(Date.now() / 500)), false)}
          color={ORANGE_BRIGHT.withAlpha(0.25)}
          outlineColor={ORANGE_BRIGHT}
          outlineWidth={2}
        />
      </Entity>
    </Viewer>
  );
}
