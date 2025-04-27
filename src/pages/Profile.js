import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { userAPI } from "../api/api";
import { showErrorToast, showSuccessToast } from "../components/Toast";

function Profile() {
  const { getTokenInfo } = useAuth();
  const {
    id,
    username,
    email,
    fullname: fullNameFromToken = "Chưa có",
    phone: phoneFromToken = "Chưa có",
    address: addressFromToken = "Chưa có",
  } = getTokenInfo();
  

  const [editMode, setEditMode] = useState(false);
  const [fullname, setFullname] = useState(fullNameFromToken);
  const [phone, setPhone] = useState(phoneFromToken);
  const [address, setAddress] = useState(addressFromToken);
  const [createdDate, setCreatedDate] = useState("Không rõ");
  const [role, setRole] = useState("Chưa có quyền");

  const handleSave = async () => {
    try {
      const updatedData = { fullname, phone, address };
      const response = await userAPI.update(id, updatedData); // ✅ Truyền đúng `id`
      if (response.status === 200) {
        showSuccessToast("Cập nhật thành công!");
        setEditMode(false); // Tắt chế độ chỉnh sửa nếu muốn
      } else {
        showErrorToast("Cập nhật thất bại!");
      }
    } catch (err) {
      if (err.response) {
        showErrorToast(err.response.data?.message || "Lỗi khi cập nhật thông tin");
      } else if (err.request) {
        showErrorToast("Không thể gửi yêu cầu đến server!");
      } else {
        showErrorToast("Lỗi không xác định!");
      }
    }
  };
  
  

  // Fetch thông tin từ API và cập nhật state
  useEffect(() => {
    userAPI.getProfile()
      .then(res => {
        const { fullname, phone, address, roles, createdDate } = res.data;

        setFullname(fullname || "Chưa có");
        setPhone(phone || "Chưa có");
        setAddress(address || "Chưa có");
        setCreatedDate(createdDate ? new Date(createdDate).toLocaleDateString() : "Không rõ");

        // Lấy quyền hạn từ roles
        if (roles && roles.length > 0) {
          setRole(roles[0].roleName || "Chưa có quyền");
        } else {
          setRole("Chưa có quyền");
        }
      })
      .catch(err => {
        console.error("Error fetching profile", err);
      });
  }, []);

  return (
    <div className="max-w-3xl p-6 mx-auto bg-white shadow-lg rounded-2xl dark:bg-gray-800">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-32 h-32 mb-4 text-4xl font-bold text-white bg-purple-200 rounded-full">
          {fullname?.charAt(0) || username?.charAt(0)}
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">{fullname}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">(@{username})</p>
        <p className="px-3 py-1 mt-1 text-sm text-purple-800 bg-purple-100 rounded-full">{role}</p>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1 px-4 py-2 mt-4 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          <PencilSquareIcon className="w-5 h-5" />
          {editMode ? "Hủy" : "Chỉnh sửa"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2">
        <InfoItem
          icon={<EnvelopeIcon className="w-5 h-5" />}
          label="Email"
          value={email || "Không có"}
        />
        <InfoItem
          icon={<CalendarIcon className="w-5 h-5" />}
          label="Ngày tạo"
          value={createdDate || "Không rõ"}
        />
        {editMode ? (
          <>
            <EditableInfo
              label="Họ tên"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
            <EditableInfo
              label="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <EditableInfo
              label="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </>
        ) : (
          <>
            <InfoItem
              icon={<UserIcon className="w-5 h-5" />}
              label="Họ tên"
              value={fullname}
            />
            <InfoItem
              icon={<PhoneIcon className="w-5 h-5" />}
              label="Số điện thoại"
              value={phone || phoneFromToken}
            />
            <InfoItem
              icon={<MapPinIcon className="w-5 h-5" />}
              label="Địa chỉ"
              value={address || addressFromToken}
            />
            <InfoItem
              icon={<UserIcon className="w-5 h-5" />}
              label="Quyền hạn"
              value={role}
            />
          </>
        )}
      </div>

      {editMode && (
        <div className="mt-6 text-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
    <div className="text-purple-600 dark:text-purple-400">{icon}</div>
    <div>
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
      <div className="text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  </div>
);

const EditableInfo = ({ label, value, onChange }) => (
  <div className="flex flex-col p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
    <label className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

export default Profile;
