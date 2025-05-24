import "ol/ol.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { areaAPI } from "../../api/api";
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
import * as yup from "yup";
import MapPicker from "./MapPicker";
import useMapStore from "../../store/useMapStore";

const Map = React.memo(MapPicker);

const modeOptions = [
  {
    label: "Readonly",
    value: 1,
  },
  {
    label: "Create",
    value: 2,
  },
  {
    label: "Update",
    value: 3,
  },
  {
    label: "Delete",
    value: 4,
  },
];

function MapLayer() {
const mapMode = useMapStore.getState().mapMode;

  const {
    areas,
    setAreas,
    branchs,
    branchSelected,
    fetchAllBranch,
    fetchAreaByBranch,
    setBranchSelected,
    areaSelected,
    setAreaSelected,
    resetAreaSelected,
    mode,
    setMode,
    deleteAreas,
    setDeleteAreas,
  } = useMapStore();
  const [errors, setErrors] = useState({});

  // Change mode readonly, create, update of map
  const handleChangeMode = (mode) => {
    setAreas(
      areas.map((a) => {
        return {
          ...a,
          isModify: mode === mapMode.update ? true : false,
        };
      })
    );
    setMode(mode);
    setErrors({});
  };

  // create new area on map
  const handleAddArea = async () => {
    const isValidForm = await handleValidateSchema();

    if (isValidForm) {
      setAreas([...areas, areaSelected]);
      resetAreaSelected();
    }
  };

  // update area on map
  const handleUpdateArea = async () => {
    const isValidForm = await handleValidateSchema();
    if (isValidForm) {
      const newAreas = areas?.map((a) => {
        if (a?.id === areaSelected?.id) {
          return areaSelected;
        }

        return a;
      });

      setAreas([...newAreas]);
      resetAreaSelected();
    }
  };

  // delete area
  const handleDeleteArea = async () => {
    try {
      const response = await areaAPI.deleteMulti(deleteAreas.join(","));
      const isDeleted = response.data?.data;

      if (isDeleted && response.data.code === 200) {
        fetchAreaByBranch(branchSelected);
        showSuccessToast("Xóa khu vực thành công");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API khu vực:", error);
    }
  };

  // Submit areas with 2 cases are create and update
  const handleSubmit = async () => {
    let data = areas?.map((a) => {
      return {
        id: a?.id,
        name: a?.name,
        posX: a?.posX,
        posY: a?.posY,
        capacity: a?.capacity,
        description: a?.description,
      };
    });

    if (mode === mapMode.create) {
      data = data.filter((d) => d.id === "");
    }

    try {
      const response = await areaAPI.createOrUpdate(branchSelected, data);
      const dataResponse = response.data?.data;

      if (dataResponse && response.data.code === 200) {
        fetchAreaByBranch(branchSelected);
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

  // Valdate schema
  const schema = yup.object({
    name: yup.string().required("Tên khu vực là bắt buộc"),
    description: yup.string().required("Mô tả là bắt buộc"),
    capacity: yup.number().min(1, "Tải trọng là bắt buộc"),
  });

  const handleValidateSchema = async () => {
    try {
      // check validate with schema
      const content = {
        name: areaSelected.name,
        description: areaSelected.description,
        capacity: areaSelected.capacity,
      };

      const result = await schema.validate(content, { abortEarly: false });
      if (result) {
        setErrors({});
        return true;
      }
    } catch (error) {
      const newErrors = error.inner?.reduce((prev, val, index) => {
        prev[val.path] = val.message;
        return prev;
      }, {});

      setErrors(newErrors);
      return false;
    }
  };

  // Hanlde store delete area
  const handleStoreDelete = (area) => {
    setDeleteAreas([area.id]);
  };

  return (
    <Box>
      <Box
        className="w-1/2 pt-5"
        display={"flex"}
        alignItems={"center"}
        gap={2}
      >
        <FormControl fullWidth>
          <InputLabel id="mapMode">Map mode</InputLabel>
          <Select
            labelId="mapMode"
            value={mode}
            label="Map mode"
            size="small"
            onChange={(e) => handleChangeMode(e.target.value)}
          >
            {modeOptions.map((m, i) => {
              return (
                <MenuItem key={i} value={m.value}>
                  {m.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="branch">Branch</InputLabel>
          <Select
            labelId="branch"
            value={branchSelected || ""}
            label="Branch"
            onChange={(e) => {
              setBranchSelected(e.target.value);
            }}
            size="small"
          >
            {Array.isArray(branchs) &&
              branchs.map((b, i) => (
                <MenuItem key={i} value={b?.id}>
                  {b?.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        {![mapMode.readonly, mapMode.delete].includes(mode) && (
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Save
          </Button>
        )}
        {mapMode.delete === mode && (
          <Button
            variant="contained"
            color="error"
            className="px-8"
            onClick={handleDeleteArea}
          >
            Delete
          </Button>
        )}
      </Box>

      <Box display={"flex"} gap={2} paddingTop={2}>
        <Map handleStoreDelete={handleStoreDelete} />

        {![mapMode.readonly, mapMode.delete].includes(mode) && (
          <div className="w-1/3">
            <Box flex={1} display={"flex"} flexDirection={"column"} gap={2}>
              <Box display={"flex"} flexDirection={"column"} gap={2}>
                <TextField
                  value={areaSelected?.name || ""}
                  onChange={(e) =>
                    setAreaSelected({ ...areaSelected, name: e.target.value })
                  }
                  fullWidth
                  label="Area name"
                  error={errors?.name || false}
                  helperText={errors?.name || ""}
                  FormHelperTextProps={{
                    style: {
                      marginLeft: "unset",
                    },
                  }}
                />
                <TextField
                  value={areaSelected?.description || ""}
                  onChange={(e) =>
                    setAreaSelected({
                      ...areaSelected,
                      description: e.target.value,
                    })
                  }
                  fullWidth
                  label="Description"
                  error={errors?.description || false}
                  helperText={errors?.description || ""}
                  FormHelperTextProps={{
                    style: {
                      marginLeft: "unset",
                    },
                  }}
                />
                <TextField
                  value={areaSelected?.capacity || ""}
                  onChange={(e) =>
                    setAreaSelected({
                      ...areaSelected,
                      capacity: e.target.value,
                    })
                  }
                  fullWidth
                  label="Capacity"
                  error={errors?.capacity || false}
                  helperText={errors?.capacity || ""}
                  FormHelperTextProps={{
                    style: {
                      marginLeft: "unset",
                    },
                  }}
                />
              </Box>

              <Box display={"flex"} alignItems={"center"} gap={2}>
                {mode === mapMode.update && (
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={handleUpdateArea}
                  >
                    Update to map
                  </Button>
                )}

                {mode === mapMode.create && (
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={handleAddArea}
                  >
                    Add to map
                  </Button>
                )}
              </Box>
            </Box>
          </div>
        )}
      </Box>
    </Box>
  );
}

export default MapLayer;
