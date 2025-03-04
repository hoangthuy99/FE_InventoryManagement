import { useState, useEffect } from "react";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Textarea, Button } from "@windmill/react-ui";
import { useParams } from "react-router-dom";

function EditCategory() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: "", code: "", description: "", activeFlag: 1 });
  const [existingCategories, setExistingCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategory();
    fetchCategories();
  }, []);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`http://localhost:8089/app/category/${id}`);
      if (!response.ok) {
        throw new Error(`Lỗi tải danh mục: ${response.statusText}`);
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      showErrorToast(error.message || "Lỗi khi tải danh mục!");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8089/app/category");
      if (!response.ok) {
        throw new Error(`Lỗi tải danh sách danh mục: ${response.statusText}`);
      }
      const data = await response.json();
      setExistingCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setExistingCategories([]);
      showErrorToast(error.message || "Không thể tải danh sách danh mục!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "activeFlag" ? Number(value) : value });

    if (name === "name") {
      const isNameDuplicate = existingCategories.some(
        (category) => category.name === value && category.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        name: isNameDuplicate ? "Tên danh mục đã tồn tại, vui lòng nhập tên khác!" : "",
      }));
    }

    if (name === "code") {
      const isCodeDuplicate = existingCategories.some(
        (category) => category.code === value && category.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        code: isCodeDuplicate ? "Mã danh mục đã tồn tại, vui lòng nhập mã khác!" : "",
      }));
    }
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
      const response = await fetch(`http://localhost:8089/app/category/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (!response.ok) {
        let errorMessage = "Cập nhật danh mục thất bại!";
        if (typeof result === "string") errorMessage = result;
        else if (result.error) errorMessage = result.error;
        else if (result.message) errorMessage = result.message;

        setErrors({ general: errorMessage });
        showErrorToast(errorMessage);
        return;
      }

      showSuccessToast("Cập nhật danh mục thành công!");
    } catch (error) {
      showErrorToast("Lỗi hệ thống, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Chỉnh sửa Danh Mục</PageTitle>
      <SectionTitle>Chỉnh sửa thông tin danh mục</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && <HelperText valid={false}>{errors.general}</HelperText>}
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Tên danh mục</span>
            <Input className="mt-1" type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <HelperText valid={false}>{errors.name}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mã danh mục</span>
            <Input className="mt-1" type="text" name="code" value={formData.code} onChange={handleChange} />
            {errors.code && <HelperText valid={false}>{errors.code}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mô tả danh mục</span>
            <Textarea className="mt-1" name="description" value={formData.description} onChange={handleChange} />
            {errors.description && <HelperText valid={false}>{errors.description}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" name="activeFlag" value={formData.activeFlag} onChange={handleChange}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Cập nhật danh mục"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditCategory;
