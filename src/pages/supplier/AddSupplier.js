import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import {
  Input,
  HelperText,
  Label,
  Select,
  Textarea,
  Button,
} from "@windmill/react-ui";
import { supplierAPI } from "../../api/api";

function AddSupplier() {
  const [formData, setFormData] = useState({
    subCode: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    activeFlag: 1,
    createdDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "activeFlag" ? Number(value) : value,
    });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name)
      newErrors.name = "Tên nhà cung cấp không được để trống!";
    if (!formData.email) {
      newErrors.email = "Email không được để trống!";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ!";
    }
    if (!formData.phone) {
      newErrors.phone = "Số điện thoại không được để trống!";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có từ 10 đến 15 số!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        subCode:
          formData.name.charAt(0).toUpperCase() +
          formData.name.split("", 1) +
          (Math.random() * 10000).toString().slice(0, 3),
      };

      await supplierAPI.add(requestData);
      showSuccessToast("Thêm nhà cung cấp thành công!");

      setFormData({
        subCode: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        activeFlag: 1,
        createdDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Thêm nhà cung cấp thất bại!";

      setErrors((prev) => ({
        ...prev,
        email: errorMessage.includes("Email đã tồn tại")
          ? errorMessage
          : undefined,
        general: !errorMessage.includes("Email đã tồn tại")
          ? errorMessage
          : undefined,
      }));

      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Thêm Nhà Cung Cấp</PageTitle>
      <SectionTitle>Nhập thông tin nhà cung cấp</SectionTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && (
          <HelperText valid={false}>{errors.general}</HelperText>
        )}

        <form onSubmit={handleSubmit}>
          {/* Tên nhà cung cấp */}
          <Label className="mt-4">
            <span>Tên nhà cung cấp</span>
            <Input
              className="mt-1"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <HelperText valid={false} className="mt-1">
                {errors.name}
              </HelperText>
            )}
          </Label>

          {/* Email nhà cung cấp */}
          <Label className="mt-4">
            <span>Email</span>
            <Input
              className="mt-1"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <HelperText valid={false} className="mt-1">
                {errors.email}
              </HelperText>
            )}
          </Label>

          {/* Số điện thoại */}
          <Label className="mt-4">
            <span>Số điện thoại</span>
            <Input
              className="mt-1"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <HelperText valid={false} className="mt-1">
                {errors.phone}
              </HelperText>
            )}
          </Label>

          {/* Địa chỉ */}
          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Textarea
              className="mt-1"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Label>

          {/* Trạng thái */}
          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select
              className="mt-1"
              name="activeFlag"
              value={formData.activeFlag}
              onChange={handleChange}
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          {/* Nút submit */}
          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm nhà cung cấp"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddSupplier;
