import { Popover } from "bootstrap";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import View from "ol/View.js";
import Point from "ol/geom/Point.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Icon from "ol/style/Icon.js";
import Style from "ol/style/Style.js";
import ImageLayer from "ol/layer/Image.js";
import { ImageStatic } from "ol/source";
import { getCenter } from "ol/extent";
import "ol/ol.css";
import { useEffect, useRef } from "react";
import { Projection } from "ol/proj";

const imageExtent = [0, 0, 1000, 1000];
const projection = new Projection({
  code: "xkcd-image",
  units: "pixels",
  extent: imageExtent,
});

function MapLayer() {
  const mapRef = useRef();
  const popupRef = useRef();

  useEffect(() => {
    const iconFeature = new Feature({
      geometry: new Point([500, 171]),
      name: "Null Island",
      population: 4000,
      rainfall: 500,
    });

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: "/logo192.png",
        scale: 1,
      }),
    });

    iconFeature.setStyle(iconStyle);

    const vectorSource = new VectorSource({
      features: [iconFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const rasterLayer = new ImageLayer({
      source: new ImageStatic({
        url: "http://localhost:3000/images/map.webp",
        imageExtent: imageExtent,
        projection: projection,
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [rasterLayer, vectorLayer],
      view: new View({
        center: getCenter(imageExtent),
        zoom: 1,
        maxZoom: 8,
        projection: projection,
      }),
    });

    const popup = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: false,
    });
    map.addOverlay(popup);

    let popover;
    function disposePopover() {
      if (popover) {
        popover.dispose();
        popover = undefined;
      }
    }
    // display popup on click
    map.on("click", function (evt) {
        console.log(evt.pixel);
        
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      disposePopover();
      if (!feature) {
        return;
      }
      popup.setPosition(evt.coordinate);
      popover = new Popover(popupRef.current, {
        placement: "top",
        html: true,
        content: feature.get("name"),
      });
      popover.show();
    });

    // change mouse cursor when over marker
    map.on("pointermove", function (e) {
      const hit = map.hasFeatureAtPixel(e.pixel);
      map.getTarget().style.cursor = hit ? "pointer" : "";
    });
    // Close the popup when the map is moved
    map.on("movestart", disposePopover);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        border: "1px solid"
      }}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      <div
        ref={popupRef}
        id="popup"
        style={{ display: "none", position: "absolute" }}
      ></div>
    </div>
  );
}

export default MapLayer;
