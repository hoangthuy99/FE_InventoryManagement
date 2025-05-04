import { useState, useEffect } from "react";
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
import { useParams } from "react-router-dom";
import { supplierAPI } from "../../api/api";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function EditSupplier() {
  const { id } = useParams();
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
  const [existingSuppliers, setExistingSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetchSupplier();
    fetchSuppliers();
  }, []);

  const fetchSupplier = async () => {
    try {
      const response = await supplierAPI.getById(id);
      const data = response.data;

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      showErrorToast(error.message || "Lỗi khi tải nhà cung cấp!");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      const data = response.data;

      if (data) {
        setExistingSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setExistingSuppliers([]);
      showErrorToast(error.message || "Không thể tải danh sách nhà cung cấp!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "activeFlag" ? Number(value) : value,
    });

    if (name === "name") {
      const isNameDuplicate = existingSuppliers.some(
        (supplier) => supplier.name === value && supplier.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        name: isNameDuplicate
          ? "Tên nhà cung cấp đã tồn tại, vui lòng nhập tên khác!"
          : "",
      }));
    }

    if (name === "code") {
      const isCodeDuplicate = existingSuppliers.some(
        (supplier) => supplier.code === value && supplier.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        code: isCodeDuplicate
          ? "Mã nhà cung cấp đã tồn tại, vui lòng nhập mã khác!"
          : "",
      }));
    }
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
      const response = await supplierAPI.update(id, formData);

      if (response.status === 200) {
        showSuccessToast("Cập nhật nhà cung cấp thành công!");
        history.push("/app/supplier/all-supplier");
      }
    } catch (error) {
      showErrorToast("Đã xảy ra lỗi: " + error.message);
      showErrorToast("Lỗi hệ thống, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Chỉnh sửa Nhà Cung Cấp</PageTitle>

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
            {loading ? "Đang xử lý..." : "Lưu nhà cung cấp"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditSupplier;
