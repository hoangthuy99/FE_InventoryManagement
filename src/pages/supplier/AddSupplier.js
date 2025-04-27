import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import * as yup from "yup";
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
import { supplierAPI } from "../../api/api";

const supplierSchema = yup.object().shape({
  name: yup.string().required("Tên nhà cung cấp không được để trống!"),
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

function AddSupplier() {
  const { id } = useParams();
  const isEditMode = !!id;
  const history = useHistory();

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (isEditMode) {
      const fetchSupplier = async () => {
        try {
          const res = await supplierAPI.getById(id);
          setFormData(res.data);
        } catch (error) {
          showErrorToast("Không thể tải thông tin nhà cung cấp!");
        }
      };
      fetchSupplier();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "activeFlag" ? Number(value) : value,
    }));
  };

  const validateForm = async () => {
    try {
      await supplierSchema.validate(formData, { abortEarly: false });
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
      if (isEditMode) {
        await supplierAPI.update(id, {
          ...formData,
          updateDate: new Date().toISOString(),
        });
        showSuccessToast("Cập nhật nhà cung cấp thành công!");
        history.push("/app/supplier/all-supplier");
      } else {
        await supplierAPI.add(formData);
        showSuccessToast("Thêm nhà cung cấp thành công!");
        setFormData({
          subCode: "",
          name: "",
          email: "",
          phone: "",
          address: "",
          activeFlag: 1,
          createdDate: new Date().toISOString(),
          updateDate: new Date().toISOString(),
        });
      }
    } catch (error) {
      showErrorToast("Có lỗi xảy ra khi xử lý nhà cung cấp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>
        {isEditMode ? "Cập nhật Nhà Cung Cấp" : "Thêm Nhà Cung Cấp"}
      </PageTitle>
      <SectionTitle>
        {isEditMode
          ? "Chỉnh sửa thông tin nhà cung cấp"
          : "Nhập thông tin nhà cung cấp"}
      </SectionTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && (
          <HelperText valid={false}>{errors.general}</HelperText>
        )}

        <form onSubmit={handleSubmit}>
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
              <HelperText valid={false}>{errors.name}</HelperText>
            )}
          </Label>

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
              <HelperText valid={false}>{errors.email}</HelperText>
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
              <HelperText valid={false}>{errors.phone}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Textarea
              className="mt-1"
              name="address"
              value={formData.address}
              onChange={handleChange}
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
            {loading
              ? "Đang xử lý..."
              : isEditMode
              ? "Cập nhật"
              : "Thêm nhà cung cấp"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddSupplier;
