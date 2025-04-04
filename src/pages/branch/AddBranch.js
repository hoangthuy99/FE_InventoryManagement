import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Button } from "@windmill/react-ui";
import { branchAPI } from "../../api/api";

function AddBranch() {
  const [formData, setFormData] = useState({
    branchCode: "",
    name: "",
    address: "",
    phone: "",
    activeFlag: 1,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "activeFlag" ? Number(value) : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Tên chi nhánh không được để trống!";
    if (!formData.address.trim())
      newErrors.address = "Địa chỉ không được để trống!";
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống!";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có từ 10 đến 15 chữ số!";
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
      let formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append("img", image);
      }
      
      await branchAPI.create(formDataToSend);
      showSuccessToast("Thêm chi nhánh thành công!");
      // setFormData({ name: "", address: "", phone: "", activeFlag: 1 });
    } catch (error) {
      console.log(error);
      
      let errorMessage = "Thêm chi nhánh thất bại!";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      showErrorToast(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // change image
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <>
      <PageTitle>Thêm Chi Nhánh</PageTitle>
      <SectionTitle>Nhập thông tin chi nhánh</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && (
          <HelperText valid={false}>{errors.general}</HelperText>
        )}
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Mã chi nhánh</span>
            <Input
              className="mt-1"
              type="text"
              name="branchCode"
              value={formData.branchCode}
              onChange={handleChange}
            />
            {errors.branchCode && (
              <HelperText valid={false} className="mt-1">
                {errors.branchCode}
              </HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Tên chi nhánh</span>
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

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Input
              className="mt-1"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && (
              <HelperText valid={false} className="mt-1">
                {errors.address}
              </HelperText>
            )}
          </Label>

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

          <Label className="mt-4">
            <span>Hình ảnh</span>
            <Input
              type="file"
              name="img"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/jpg"
            />
          </Label>

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

          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm chi nhánh"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddBranch;
