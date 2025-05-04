import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
import { useParams } from "react-router-dom";
import { categoryAPI } from "../../api/api";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const schema = yup.object().shape({
  name: yup.string().required("Tên danh mục không được để trống!"),
  description: yup.string().required("Mô tả không được để trống!"),
  activeFlag: yup.number().oneOf([0, 1]),
});

function EditCategory() {
  const { id } = useParams();
  const history = useHistory();
  const [existingCategories, setExistingCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      activeFlag: 1,
    },
  });

  useEffect(() => {
    fetchCategory();
    fetchCategories();
  }, []);

  const fetchCategory = async () => {
    try {
      const response = await categoryAPI.getById(id);
      const data = response.data;
      if (data) {
        // Set values to form
        Object.keys(data).forEach((key) => {
          setValue(key, data[key]);
        });
      }
    } catch (error) {
      showErrorToast("Lỗi khi tải danh mục!");
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
      showErrorToast("Không thể tải danh sách danh mục!");
    }
  };

  const onSubmit = async (formData) => {
    // Check duplicate name and code
    const isNameDuplicate = existingCategories.some(
      (c) => c.name === formData.name && c.id !== Number(id)
    );
    const isCodeDuplicate = existingCategories.some(
      (c) => c.code === formData.code && c.id !== Number(id)
    );

    if (isNameDuplicate) {
      setError("name", {
        type: "manual",
        message: "Tên danh mục đã tồn tại, vui lòng nhập tên khác!",
      });
      return;
    }

    if (isCodeDuplicate) {
      setError("code", {
        type: "manual",
        message: "Mã danh mục đã tồn tại, vui lòng nhập mã khác!",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await categoryAPI.update(id, formData);
      if (response.status === 200) {
        showSuccessToast("Cập nhật danh mục thành công!");
        history.push("/app/category/all-category");
      }
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Label>
            <span>Tên danh mục</span>
            <Input className="mt-1" {...register("name")} />
            {errors.name && (
              <HelperText valid={false}>{errors.name.message}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Mã danh mục</span>
            <Input className="mt-1" {...register("code")} />
            {errors.code && (
              <HelperText valid={false}>{errors.code.message}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Mô tả danh mục</span>
            <Textarea className="mt-1" {...register("description")} />
            {errors.description && (
              <HelperText valid={false}>{errors.description.message}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" {...register("activeFlag")}>
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
