import { useState } from "react";
import * as yup from "yup";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Textarea, Button } from "@windmill/react-ui";
import { customerAPI } from "../../api/api";

const customerSchema = yup.object().shape({
  name: yup.string().required("Tên khách hàng không được để trống!"),
  email: yup
    .string()
    .email("Email không hợp lệ!")
    .required("Email không được để trống!"),
  phone: yup
    .string()
    .required("Số điện thoại không được để trống!")
    .matches(/^\d{10,15}$/, "Số điện thoại phải có từ 10 đến 15 số!"),
  address: yup.string(),
  activeFlag: yup.number().oneOf([0, 1]),
});

function AddCustomer() {
  const [formData, setFormData] = useState({
    id: null, // Thêm ID để xác định update hay create
    cusCode: "",
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

  const validateForm = async () => {
    try {
      await customerSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true);

    try {
      if (formData.id) {
        // UPDATE
        await customerAPI.update(formData.id, formData);
        showSuccessToast("Cập nhật khách hàng thành công!");
      } else {
        // CREATE
        await customerAPI.create(formData);
        showSuccessToast("Thêm khách hàng thành công!");
      }

      // Reset lại form
      setFormData({
        id: null,
        cusCode: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        activeFlag: 1,
        createdDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Thao tác thất bại!";
      setErrors((prev) => ({
        ...prev,
        email: errorMessage.includes("Email đã tồn tại") ? errorMessage : undefined,
        general: !errorMessage.includes("Email đã tồn tại") ? errorMessage : undefined,
      }));
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>{formData.id ? "Cập Nhật Khách Hàng" : "Thêm Khách Hàng"}</PageTitle>
      <SectionTitle>Nhập thông tin khách hàng</SectionTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && <HelperText valid={false}>{errors.general}</HelperText>}

        <form onSubmit={handleSubmit}>

          <Label className="mt-4">
            <span>Tên khách hàng</span>
            <Input className="mt-1" type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <HelperText valid={false}>{errors.name}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Email</span>
            <Input className="mt-1" type="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <HelperText valid={false}>{errors.email}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Số điện thoại</span>
            <Input className="mt-1" type="text" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <HelperText valid={false}>{errors.phone}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Textarea className="mt-1" name="address" value={formData.address} onChange={handleChange} />
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" name="activeFlag" value={formData.activeFlag} onChange={handleChange}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : formData.id ? "Cập nhật khách hàng" : "Thêm khách hàng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddCustomer;
