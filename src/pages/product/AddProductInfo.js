import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, Label, Textarea, Button, Select, HelperText } from "@windmill/react-ui";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "", 
    activeFlag: 1,
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8089/app/category", {
          method: "GET",
        });
        if (!response.ok) throw new Error("Không thể tải danh mục!");

        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          throw new Error("Dữ liệu danh mục không hợp lệ!");
        }
      } catch (error) {
        showErrorToast("Lỗi khi tải danh mục: " + error.message);
        setCategories([]); 
      }
    };

    fetchCategories();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý thay đổi hình ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await fetch("http://localhost:8089/app/product/add-product", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        const newErrors = result.errors || { general: result.error || "Thêm sản phẩm thất bại!" };
        setErrors(newErrors);
        return;
      }

      showSuccessToast("Thêm sản phẩm thành công!");
      setFormData({
        name: "",
        code: "",
        description: "",
        category: "",
        activeFlag: 1,
      });
      setImage(null);
    } catch (error) {
      showErrorToast("Lỗi kết nối server!");
      setLoading(false);
    }
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
            <Input className="mt-1" type="text" name="name" value={formData.name} onChange={handleChange} />
            {errors.name && <HelperText valid={false}>{errors.name}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mã sản phẩm</span>
            <Input className="mt-1" type="text" name="code" value={formData.code} onChange={handleChange}  />
            {errors.code && <HelperText valid={false}>{errors.code}</HelperText>}
          </Label>
          <Label className="mt-4">
            <span>Số lượng sản phẩm</span>
            <Input className="mt-1" type="text" name="qty" value={formData.qty} onChange={handleChange}  />
            {errors.qty && <HelperText valid={false}>{errors.qty}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Giá bán sản phẩm</span>
            <Input className="mt-1" type="text" name="price" value={formData.price} onChange={handleChange}  />
            {errors.price && <HelperText valid={false}>{errors.price}</HelperText>}
          </Label>
          
          <Label className="mt-4">
            <span>Mô tả sản phẩm</span>
            <Textarea className="mt-1" name="description" value={formData.description} onChange={handleChange} />
            {errors.description && <HelperText valid={false}>{errors.description}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Danh mục</span>
            <Select className="mt-1" name="category" value={formData.category} onChange={handleChange} >
              <option value="">-- Chọn danh mục --</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Không có danh mục</option>
              )}
            </Select>
            {errors.category && <HelperText valid={false}>{errors.category}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Hình ảnh sản phẩm</span>
            <Input type="file" onChange={handleImageChange} accept="image/jpeg,image/png,image/jpg" />
            {errors.image && <HelperText valid={false}>{errors.image}</HelperText>}
          </Label>

          <Button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;
