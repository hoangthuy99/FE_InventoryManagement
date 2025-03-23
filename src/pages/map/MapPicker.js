import { Popover } from "bootstrap";
import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import View from "ol/View.js";
import Point from "ol/geom/Point.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Icon from "ol/style/Icon.js";
import ImageLayer from "ol/layer/Image.js";
import { ImageStatic } from "ol/source";
import { getCenter } from "ol/extent";
import "ol/ol.css";
import React, { useEffect, useRef } from "react";
import { Projection } from "ol/proj";
import Style from "ol/style/Style";
import Modify from "ol/interaction/Modify.js";
import useMapStore from "../../store/useMapStore";

const imageExtent = [0, 0, 1000, 1000];
const projection = new Projection({
  code: "xkcd-image",
  units: "pixels",
  extent: imageExtent,
});

const map = new Map({
  view: new View({
    center: getCenter(imageExtent),
    zoom: 1,
    minZoom: 1,
    maxZoom: 8,
    projection: projection,
  }),
});

const rasterLayer = new ImageLayer({
  source: new ImageStatic({
    url: "/images/map.webp",
    imageExtent: imageExtent,
    projection: projection,
  }),
});

const BASE_URL = process.env.REACT_APP_BASE_URL;

function MapPicker({ handleStoreDelete }) {
  const mapRef = useRef();
  const popupRef = useRef();
  const {
    areas,
    setAreas,
    setAreaSelected,
    mode,
    mapMode,
    branchs,
    branchSelected,
  } = useMapStore();

  useEffect(() => {
    if (areas) {
      const featerList = areas?.map((a, index) => {
        const feater = new Feature({
          id: a?.id,
          geometry: new Point([a?.posX, a?.posY]),
          name: a?.name,
          capacity: a?.capacity,
          description: a?.description,
          isModify: a?.isModify || mode === mapMode.modify,
          isDelete: a?.isDelete,
          index,
        });

        let color;
        if (a?.isModify) {
          color = "#00abed";
        } else if (a?.isDelete) {
          color = "#f50538";
        }
        const iconStyle = new Style({
          image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: "/images/mapIcon2.svg",
            scale: 0.07,
            color: color,
          }),
        });

        feater.setStyle(iconStyle);

        return feater;
      });

      // Set layer and source for map
      const vectorSource = new VectorSource({
        features: featerList,
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      const imageUrl = branchs.find((b) => {              
        return b.id === branchSelected;
      })?.mapImage;
      rasterLayer.setSource(
        new ImageStatic({
          url: `${BASE_URL}/${imageUrl}`,
          imageExtent: imageExtent,
          projection: projection,
        })
      );
      map.setTarget(mapRef.current);
      map.setLayers([rasterLayer, vectorLayer]);

      // Set popup for map
      const popup = new Overlay({
        element: popupRef.current,
        positioning: "top",
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

      // handle selecte area when click on map
      map.on("click", function (evt) {
        const feature = map.forEachFeatureAtPixel(
          evt.pixel,
          function (feature) {
            return feature;
          }
        );

        if (feature) {
          const area = areas?.find((a, index) => {
            return index === feature.get("index");
          });

          if (feature.get("isModify")) {
            setAreaSelected(area);
          }

          if (mode === mapMode.delete) {
            handleStoreDelete(area);
          }
        }
      });

      // display popup each hover
      map.on("pointermove", function (evt) {
        const hit = map.hasFeatureAtPixel(evt.pixel);
        map.getTarget().style.cursor = hit ? "pointer" : "";

        const feature = map.forEachFeatureAtPixel(
          evt.pixel,
          function (feature) {
            return feature;
          }
        );

        disposePopover();
        if (!feature) {
          return;
        }

        const content = `
            <div class="bg-gray-400 text-sm font-mono px-3 py-2 border border-blue-500 rounded-md" >
              <h3>${feature.get("name")}</h3>
              <p>Capacity: ${feature.get("capacity")}</p>
            </div>
            `;

        popup.setPosition(evt.coordinate);
        popover = new Popover(popupRef.current, {
          placement: "top",
          html: true,
          content: content,
          animation: true,
        });
        popover.show();
      });

      // Close the popup when the map is moved
      map.on("movestart", disposePopover);

      // Move point on the map
      const modify = new Modify({
        hitDetection: vectorLayer,
        source: vectorSource,
        style: null,
        condition: (event) => {
          const feater = map.forEachFeatureAtPixel(event.pixel, (f) => f);
          return feater?.get("isModify");
        },
      });
      modify.on(["modifystart", "modifyend"], function (evt) {
        if (evt.type === "modifyend") {
          const featureSelected = evt.features.getArray()[0];

          // Get new coordinates at the end of the move point
          const newCoordinates = featureSelected.getGeometry().getCoordinates();

          const modifedArea = areas?.map((a) => {
            if (a.id === featureSelected.values_.id) {
              a["posX"] = parseFloat(newCoordinates[0]).toFixed(3);
              a["posY"] = parseFloat(newCoordinates[1]).toFixed(3);
            }

            return a;
          });

          setAreas(modifedArea);
        }

        mapRef.current.style.cursor =
          evt.type === "modifystart" ? "grabbing" : "pointer";
      });
      modify.setActive(true);

      // Add and remove feater event
      const overlaySource = modify.getOverlay().getSource();
      overlaySource.on(["addfeature", "removefeature"], function (evt) {
        mapRef.current.style.cursor =
          evt.type === "addfeature" ? "pointer" : "";
      });

      map.addInteraction(modify);
    }
  }, [areas]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        border: "1px solid",
      }}
    >
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      <div ref={popupRef} id="popup" style={{ position: "absolute" }}></div>
    </div>
  );
}

export default MapPicker;
