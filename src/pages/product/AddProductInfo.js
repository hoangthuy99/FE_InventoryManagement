import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, Label, Textarea, Button, Select, HelperText } from "@windmill/react-ui";
import { productAPI, categoryAPI } from "../../api/api";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    qty: "",
    price: "",
    description: "",
    categoryId: "",
    activeFlag: 1,
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Lỗi khi gọi API danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm không được để trống!";
    if (!formData.code.trim()) {
      newErrors.code = "Mã sản phẩm không được để trống!";
    } else if (!/^[A-Za-z]{2}\d{3}$/.test(formData.code)) {
      newErrors.code = "Mã sản phẩm phải có 5 ký tự, bắt đầu bằng 2 chữ cái và 3 số!";
    }
    if (!formData.qty.trim() || isNaN(formData.qty) || Number(formData.qty) <= 0) {
      newErrors.qty = "Số lượng phải là số nguyên dương!";
    }
    if (!formData.price.trim() || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Giá phải là số lớn hơn 0!";
    }
    if (!formData.categoryId) newErrors.categoryId = "Vui lòng chọn danh mục!";
    if (!formData.description.trim()) newErrors.description = "Mô tả không được để trống!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append("img", image);
      }

      await productAPI.create(formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      showSuccessToast("Thêm sản phẩm thành công!");
      setFormData({ name: "", code: "", qty: "", price: "", description: "", categoryId: "", activeFlag: 1 });
      setImage(null);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400 && data.errors) {
          setErrors(data.errors);
        } else {
          showErrorToast("Lỗi: " + (data.message || "Thêm sản phẩm thất bại!"));
        }
      } else {
        showErrorToast("Lỗi kết nối server!");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <PageTitle>Thêm Sản Phẩm</PageTitle>
      <SectionTitle>Nhập thông tin sản phẩm</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && <HelperText valid={false}>{errors.general}</HelperText>}
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Tên sản phẩm</span>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <HelperText valid={false}>{errors.name}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Mã sản phẩm</span>
            <Input type="text" name="code" value={formData.code} onChange={handleChange} />
            {errors.code && <HelperText valid={false}>{errors.code}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Số lượng</span>
            <Input type="number" name="qty" value={formData.qty} onChange={handleChange} />
            {errors.qty && <HelperText valid={false}>{errors.qty}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Giá</span>
            <Input type="number" name="price" value={formData.price} onChange={handleChange} />
            {errors.price && <HelperText valid={false}>{errors.price}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Mô tả</span>
            <Textarea name="description" value={formData.description} onChange={handleChange} />
            {errors.description && <HelperText valid={false}>{errors.description}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Danh mục</span>
            <Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
            {errors.categoryId && <HelperText valid={false}>{errors.categoryId}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Hình ảnh</span>
            <Input type="file" name="img" onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg" />
          </Label>
          <Button type="submit" disabled={loading} className="mt-4">
            {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;
