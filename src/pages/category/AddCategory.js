import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Textarea, Button } from "@windmill/react-ui";
import { categoryAPI } from "../../api/api"; 

function AddCategory() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    activeFlag: 1,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "activeFlag" ? Number(value) : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên danh mục không được để trống!";
    if (!formData.code.trim()) {
      newErrors.code = "Mã danh mục không được để trống!";
    } else if (!/^[A-Za-z]{2}\d{3}$/.test(formData.code)) {
      newErrors.code = "Mã danh mục phải có 5 ký tự, bắt đầu bằng 2 chữ cái và 3 số!";
    }
    if (!formData.description.trim()) newErrors.description = "Mô tả không được để trống!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await categoryAPI.create(formData);
      showSuccessToast("Thêm danh mục thành công!");
      setFormData({ name: "", code: "", description: "", activeFlag: 1 });
    } catch (error) {
      let errorMessage = "Thêm danh mục thất bại!";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }

      if (errorMessage.includes("Tên danh mục đã tồn tại")) {
        setErrors({ name: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }

      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Thêm Danh Mục</PageTitle>
      <SectionTitle>Nhập thông tin danh mục</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && <HelperText valid={false}>{errors.general}</HelperText>}
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Tên danh mục</span>
            <Input className="mt-1" type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <HelperText valid={false} className="mt-1">{errors.name}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mã danh mục</span>
            <Input className="mt-1" type="text" name="code" value={formData.code} onChange={handleChange} />
            {errors.code && <HelperText valid={false} className="mt-1">{errors.code}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mô tả danh mục</span>
            <Textarea className="mt-1" name="description" value={formData.description} onChange={handleChange} />
            {errors.description && <HelperText valid={false} className="mt-1">{errors.description}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" name="activeFlag" value={formData.activeFlag} onChange={handleChange}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm danh mục"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddCategory;
