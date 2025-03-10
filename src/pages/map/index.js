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
import { useEffect, useRef, useState } from "react";
import { Projection } from "ol/proj";
import Style from "ol/style/Style";
import Modify from "ol/interaction/Modify.js";
import { areaAPI, branchAPI } from "../../api/api";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { showSuccessToast } from "../../components/Toast";

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

const center = map.getView().getCenter();

const baseData = {
  id: 0,
  name: "",
  posX: center[0] + Math.random() * 5,
  posY: center[1] + Math.random() * 5,
  capacity: 0,
  description: "",
  branchId: 0,
  isNew: true,
};

function MapLayer() {
  const mapRef = useRef();
  const popupRef = useRef();
  const [areas, setAreas] = useState();
  const [areaSelected, setAreaSelected] = useState(baseData);
  const [branchs, setBranchs] = useState();
  const [branchSelected, setBranchSelected] = useState();

  const fetchAreaByBranch = async (branchId) => {
    try {
      const response = await areaAPI.getByBranch(branchId);
      const data = response.data?.data;
      console.log(data);

      if (data) {
        setAreas(data);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API khu vực:", error);
    }
  };

  const fetchAllBranch = async () => {
    try {
      const response = await branchAPI.getAll();
      const data = response.data;
      if (data) {
        setBranchs(data);
        setBranchSelected(data[0]?.id);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API chi nhánh:", error);
    }
  };
  // create new area
  const handleAddArea = () => {
    const newArea = {
      id: areas[areas.length - 1].id + 1,
      name: areaSelected.name,
      posX: center[0] + Math.random() * 5,
      posY: center[1] + Math.random() * 5,
      capacity: areaSelected.capacity,
      description: areaSelected.description,
      branchId: branchSelected,
      isNew: true,
    };

    setAreas([...areas, newArea]);
    setAreaSelected(baseData);
  };

  // update area
  const handleUpdateArea = () => {
    const newAreas = areas?.map((a) => {
      if (a?.id === areaSelected?.id) {
        return areaSelected;
      }

      return a;
    });

    setAreas([...newAreas]);
    setAreaSelected(baseData);
  };

  // Submit areas
  const handleSubmit = async () => {
    const data = areas?.map((a) => {
      return {
        id: a?.isNew ? "" : a?.id,
        name: a?.name,
        posX: a?.posX,
        posY: a?.posY,
        capacity: a?.capacity,
        description: a?.description,
      };
    });

    try {
      const response = await areaAPI.createOrUpdate(branchSelected, data);
      const dataResponse = response.data?.data;

      if (dataResponse && response.data.code === 200) {
        setAreas(dataResponse);
        showSuccessToast("Thêm khu vực thành công");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API khu vực:", error);
    }
  };

  useEffect(() => {
    fetchAllBranch();
  }, []);

  useEffect(() => {
    if (branchSelected) {
      fetchAreaByBranch(branchSelected);
    }
  }, [branchSelected]);

  useEffect(() => {
    if (areas) {
      const featerList = areas?.map((a) => {
        const feater = new Feature({
          id: a?.id,
          geometry: new Point([a?.posX, a?.posY]),
          name: a?.name,
          capacity: a?.capacity,
          description: a?.description,
          isNew: a?.isNew,
        });

        const iconStyle = new Style({
          image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: "/images/mapIcon.svg",
            scale: 0.07,
            color: a?.isNew ? "#00abed" : "#000",
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

      const rasterLayer = new ImageLayer({
        source: new ImageStatic({
          url: "/images/map.webp",
          imageExtent: imageExtent,
          projection: projection,
        }),
      });
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
          const area = areas?.find((a) => {
            return a.id === feature.get("id");
          });

          setAreaSelected(area);
        }
      });

      // display popup on click
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
          return feater?.get("isNew");
        },
      });
      modify.on(["modifystart", "modifyend"], function (evt) {
        if (evt.type === "modifyend") {
          const featureSelected = evt.features.getArray()[0];

          // Get new coordinates at the end of the move point
          const newCoordinates = featureSelected.getGeometry().getCoordinates();
          console.log(newCoordinates);

          const modifedArea = areas?.map((a) => {
            if (a.id === featureSelected.values_.id) {
              a["posX"] = parseFloat(newCoordinates[0]).toFixed(3);
              a["posY"] = parseFloat(newCoordinates[1]).toFixed(3);
            }

            return a;
          });

          setAreas([...modifedArea]);
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
    <Box display={"flex"} gap={2} paddingTop={2}>
      <div
        style={{
          position: "relative",
          width: "70%",
          height: "600px",
          border: "1px solid",
        }}
      >
        <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
        <div ref={popupRef} id="popup" style={{ position: "absolute" }}></div>
      </div>

      <Box flex={1} display={"flex"} flexDirection={"column"} gap={2}>
        <Box display={"flex"} alignItems={"center"} gap={2}>
          {areaSelected?.id > 0 ? (
            <Button variant="contained" size="small" onClick={handleUpdateArea}>
              Update area
            </Button>
          ) : (
            <Button variant="contained" size="small" onClick={handleAddArea}>
              Add area
            </Button>
          )}

          <FormControl fullWidth>
            <InputLabel id="branch">Branch</InputLabel>
            <Select
              labelId="branch"
              value={branchSelected || ""}
              label="Branch"
              onChange={(e) => {
                setBranchSelected(e.target.value);
              }}
            >
              {branchs?.map((b, i) => {
                return (
                  <MenuItem key={i} value={b?.id}>
                    {b?.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        <Box display={"flex"} flexDirection={"column"} gap={2}>
          <TextField
            value={areaSelected?.name || ""}
            onChange={(e) =>
              setAreaSelected({ ...areaSelected, name: e.target.value })
            }
            fullWidth
            label="Area name"
          />
          <TextField
            value={areaSelected?.description || ""}
            onChange={(e) =>
              setAreaSelected({ ...areaSelected, description: e.target.value })
            }
            fullWidth
            label="Description"
          />
          <TextField
            value={areaSelected?.capacity || ""}
            onChange={(e) =>
              setAreaSelected({ ...areaSelected, capacity: e.target.value })
            }
            fullWidth
            label="Capacity"
          />
        </Box>

        <Button variant="contained" color="success" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default MapLayer;
