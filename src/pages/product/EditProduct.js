import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, Label, Textarea, Button, Select, HelperText } from "@windmill/react-ui";
import { productAPI, categoryAPI } from "../../api/api";

function EditProduct() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    qty: "",
    price: "",
    description: "",
    categoryId: "",
    activeFlag: 1,
    img: "",
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        setFormData(response.data);
      } catch (error) {
        showErrorToast("Không thể tải dữ liệu sản phẩm!");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(response.data);
      } catch (error) {
        showErrorToast("Lỗi khi tải danh mục!");
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Tên sản phẩm không được để trống" }));
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append("img", image);
      }

      await productAPI.update(id, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccessToast("Cập nhật sản phẩm thành công!");
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm!");
    }
    setLoading(false);
  };

  return (
    <>
      <PageTitle>Chỉnh Sửa Sản Phẩm</PageTitle>
      <SectionTitle>Cập nhật thông tin sản phẩm</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Tên sản phẩm</span>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <HelperText valid={false}>{errors.name}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Mã sản phẩm</span>
            <Input type="text" name="code" value={formData.code} onChange={handleChange} />
          </Label>
          <Label className="mt-4">
            <span>Số lượng</span>
            <Input type="number" name="qty" value={formData.qty} onChange={handleChange} />
          </Label>
          <Label className="mt-4">
            <span>Giá</span>
            <Input type="number" name="price" value={formData.price} onChange={handleChange} />
          </Label>
          <Label className="mt-4">
            <span>Mô tả</span>
            <Textarea name="description" value={formData.description} onChange={handleChange} />
          </Label>
          <Label className="mt-4">
            <span>Danh mục</span>
            <Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </Label>
          <Label className="mt-4">
            <span>Hình ảnh</span>
            <Input type="file" onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg" />
            {formData.img && (
              <img src={`http://localhost:8089/${formData.img}`} alt={formData.name} className="h-32 mt-2" />
            )}
          </Label>
          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" name="activeFlag" value={formData.activeFlag} onChange={handleChange}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>
          <Button type="submit" disabled={loading} className="mt-4">
            {loading ? "Đang xử lý..." : "Cập nhật sản phẩm"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditProduct;
