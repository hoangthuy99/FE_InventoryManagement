import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LocationPicker = ({ location, onSelectAddress }) => {
    const [markerPos, setMarkerPos] = useState(location || [10.7769, 106.7009]);
  
    useEffect(() => {
      if (location) {
        setMarkerPos(location); // Cập nhật vị trí marker khi location thay đổi
      }
    }, [location]);
  
    // Xử lý click trên bản đồ để chọn địa chỉ
    const MapClickHandler = () => {
      useMapEvents({
        click: async (e) => {
          const { lat, lng } = e.latlng;
          setMarkerPos([lat, lng]);
  
          // Gọi API để lấy địa chỉ từ tọa độ
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const address = data.display_name || "Không tìm thấy địa chỉ";
  
          onSelectAddress(address, [lat, lng]);
        },
      });
      return null;
    };
  
    const MapUpdater = () => {
      const map = useMap();
      useEffect(() => {
        map.setView(markerPos, 13);
      }, [markerPos, map]);
      return null;
    };
  
    return (
      <MapContainer center={markerPos} zoom={13} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={markerPos} />
        <MapClickHandler />
        <MapUpdater />
      </MapContainer>
    );
  };
  

export default LocationPicker;
