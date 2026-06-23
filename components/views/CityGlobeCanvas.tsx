"use client";

import "@/lib/cesiumBaseUrl";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";
import { Entity, LabelGraphics, PointGraphics, Viewer } from "resium";
import { useEffect, useRef } from "react";
import { CITIES } from "@/lib/cities";

const ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
if (ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = ION_TOKEN;
}

const ORANGE = Cesium.Color.fromCssColorString("#FF6B1A");
const ORANGE_BRIGHT = Cesium.Color.fromCssColorString("#FF4500");
const TEXT_BRIGHT = Cesium.Color.fromCssColorString("#E8E8EC");

export interface FlyToRequest {
  lat: number;
  lng: number;
  requestId: number;
}

interface CityGlobeCanvasProps {
  activeCityName: string;
  flyToRequest: FlyToRequest | null;
}

// Same dynamic-import-without-ref-forwarding constraint as WorldGlobeCanvas —
// flyTo is requested via a prop instead of an imperative ref handle.
export function CityGlobeCanvas({ activeCityName, flyToRequest }: CityGlobeCanvasProps) {
  const viewerRef = useRef<{ cesiumElement?: Cesium.Viewer } | null>(null);

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

      // Initial framing: centered on Europe.
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(15, 50, 5_000_000),
      });

      cleanup = () => {
        viewer.imageryLayers.layerAdded.removeEventListener(darkenLayers);
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

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(flyToRequest.lng, flyToRequest.lat, 3_000_000),
        duration: 2.6,
      });
    }, 50);

    return () => clearInterval(poll);
  }, [flyToRequest]);

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
      {CITIES.map((city) => {
        const isActive = city.name === activeCityName;
        return (
          <Entity key={city.name} position={Cesium.Cartesian3.fromDegrees(city.lng, city.lat)} name={city.name}>
            <PointGraphics
              pixelSize={
                new Cesium.CallbackProperty(
                  () =>
                    isActive
                      ? 20 + 12 * Math.abs(Math.sin(Date.now() / 450))
                      : 5 + 3 * Math.abs(Math.sin(Date.now() / 600)),
                  false
                )
              }
              color={isActive ? ORANGE_BRIGHT.withAlpha(0.35) : ORANGE}
              outlineColor={ORANGE_BRIGHT}
              outlineWidth={isActive ? 2 : 1}
            />
            <LabelGraphics
              text={city.name}
              font={isActive ? "13px JetBrains Mono, monospace" : "10px JetBrains Mono, monospace"}
              fillColor={isActive ? ORANGE_BRIGHT : TEXT_BRIGHT}
              pixelOffset={new Cesium.Cartesian2(12, 0)}
              horizontalOrigin={Cesium.HorizontalOrigin.LEFT}
              showBackground={false}
              disableDepthTestDistance={Number.POSITIVE_INFINITY}
            />
          </Entity>
        );
      })}
    </Viewer>
  );
}
