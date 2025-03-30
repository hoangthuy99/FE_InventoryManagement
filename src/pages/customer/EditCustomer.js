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
import { categoryAPI, customerAPI } from "../../api/api";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function EditCustomer() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    cusCode: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    activeFlag: 1,
    createdDate: new Date().toISOString(),
    updateDate: new Date().toISOString(),
  });
  const [existingCategories, setExistingCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetchCustomer();
    fetchCategories();
  }, []);

  const fetchCustomer = async () => {
    try {
      const response = await customerAPI.getById(id);
      const data = response.data;

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      showErrorToast(error.message || "Lỗi khi tải thông tin khách hàng!");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const data = response.data;

      if (data) {
        setExistingCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setExistingCategories([]);
      showErrorToast(error.message || "Không thể tải danh sách khách hàng!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "activeFlag" ? Number(value) : value,
    });

    if (name === "name") {
      const isNameDuplicate = existingCategories.some(
        (customer) => customer.name === value && customer.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        name: isNameDuplicate
          ? "Tên khách hàng đã tồn tại, vui lòng nhập tên khác!"
          : "",
      }));
    }

    if (name === "code") {
      const isCodeDuplicate = existingCategories.some(
        (customer) => customer.cusCode === value && customer.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        code: isCodeDuplicate
          ? "Mã khách hàng đã tồn tại, vui lòng nhập mã khác!"
          : "",
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Tên khách hàng không được để trống!";
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
      const response = await customerAPI.update(id, formData);

      if (response.status === 200) {
        showSuccessToast("Cập nhật khách hàng thành công!");
        history.push("/app/customer/all-customer");
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
      <PageTitle>Chỉnh sửa khách hàng</PageTitle>
      <SectionTitle>Chỉnh sửa thông tin khách hàng</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && (
          <HelperText valid={false}>{errors.general}</HelperText>
        )}
        <form onSubmit={handleSubmit}>
          {/* Mã khách hàng */}
          <Label>
            <span>Mã khách hàng</span>
            <Input
              className="mt-1"
              type="text"
              name="cusCode"
              value={formData.cusCode}
              onChange={handleChange}
            />
            {errors.cusCode && (
              <HelperText valid={false} className="mt-1">
                {errors.cusCode}
              </HelperText>
            )}
          </Label>

          {/* Tên khách hàng */}
          <Label className="mt-4">
            <span>Tên khách hàng</span>
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

          {/* Email khách hàng */}
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
            {loading ? "Đang xử lý..." : "Lưu khách hàng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditCustomer;
