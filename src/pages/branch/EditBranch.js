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
import { branchAPI, categoryAPI } from "../../api/api";

function EditBranch() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    branchCode: "",
    name: "",
    address: "",
    phone: "",
    activeFlag: 1,
  });
  const [existingBranchs, setExistingBranch] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchBranch();
    fetchBranchs();
  }, []);

  const fetchBranch = async () => {
    try {
      const response = await branchAPI.getById(id);
      const data = await response.data;

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      showErrorToast(error.message || "Lỗi khi tải chi nhánh!");
    }
  };

  const fetchBranchs = async () => {
    try {
      const response = await branchAPI.getAll();
      const data = response.data;

      if (data) {
        setExistingBranch(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setExistingBranch([]);
      showErrorToast(error.message || "Không thể tải danh sách danh mục!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "activeFlag" ? Number(value) : value,
    });

    if (name === "name") {
      const isNameDuplicate = existingBranchs.some(
        (category) => category.name === value && category.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        name: isNameDuplicate
          ? "Tên chi nhánh đã tồn tại, vui lòng nhập tên khác!"
          : "",
      }));
    }

    if (name === "code") {
      const isCodeDuplicate = existingBranchs.some(
        (category) => category.code === value && category.id !== Number(id)
      );
      setErrors((prev) => ({
        ...prev,
        code: isCodeDuplicate
          ? "Mã chi nhánh đã tồn tại, vui lòng nhập mã khác!"
          : "",
      }));
    }
  };

  // change image
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name?.trim())
      newErrors.name = "Tên chi nhánh không được để trống!";
    if (!formData.branchCode?.trim()) {
      newErrors.branchCode = "Mã chi nhánh không được để trống!";
    } else if (!/^[A-Za-z]{2}\d{3}$/.test(formData.branchCode)) {
      newErrors.branchCode =
        "Mã chi nhánh phải có 5 ký tự, bắt đầu bằng 2 chữ cái và 3 số!";
    }
    setErrors(newErrors);
    console.log(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const isValidForm = validateForm();
    console.log(isValidForm);

    if (!isValidForm) return;
    setLoading(true);

    try {
      let formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append("img", image);
      }

      const response = await branchAPI.update(id, formDataToSend);

      if (response.status === 200) {
        showSuccessToast("Cập nhật chi nhánh thành công!");
      }
    } catch (error) {
      showErrorToast("Lỗi hệ thống, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Chỉnh sửa chi nhánh</PageTitle>
      <SectionTitle>Chỉnh sửa thông tin chi nhánh</SectionTitle>
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
            {loading ? "Đang xử lý..." : "Lưu chi nhánh"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditBranch;
