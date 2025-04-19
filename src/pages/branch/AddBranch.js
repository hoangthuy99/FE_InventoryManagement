import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useParams, useHistory } from "react-router-dom";
import {
  Input,
  HelperText,
  Label,
  Select,
  Button,
} from "@windmill/react-ui";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { branchAPI } from "../../api/api";

function AddBranch() {
  const { id } = useParams();
  const history = useHistory();
  const [image, setImage] = useState(null);
  const [currentImg, setCurrentImg] = useState(null);

  const validationSchema = yup.object({
    branchCode: yup.string(),
    name: yup.string().required("Tên chi nhánh không được để trống!"),
    address: yup.string().required("Địa chỉ không được để trống!"),
    phone: yup
      .string()
      .required("Số điện thoại không được để trống!")
      .matches(/^\d{10,15}$/, "Số điện thoại phải có từ 10 đến 15 chữ số!"),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ"),
  });

  const formik = useFormik({
    initialValues: {
      branchCode: "",
      name: "",
      address: "",
      phone: "",
      activeFlag: 1,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formDataToSend = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        formDataToSend.append(key, val);
      });
      if (image) {
        formDataToSend.append("img", image);
      }

      try {
        if (id) {
          await branchAPI.update(id, formDataToSend);
          showSuccessToast("Cập nhật chi nhánh thành công!");
        } else {
          await branchAPI.create(formDataToSend);
          showSuccessToast("Thêm chi nhánh thành công!");
        }
        history.push("/app/branch/all-branch");
      } catch (error) {
        const msg = error.response?.data?.message || "Thao tác thất bại!";
        showErrorToast(msg);
      }
    },
  });

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const res = await branchAPI.getById(id);
        const data = res.data;
        formik.setValues({
          branchCode: data.branchCode || "",
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          activeFlag: data.activeFlag ?? 1,
        });
        setCurrentImg(data.img || null);
      } catch {
        showErrorToast("Không thể tải dữ liệu chi nhánh!");
      }
    };
    fetchData();
  }, [id]);

  return (
    <>
      <PageTitle>{id ? "Chỉnh sửa" : "Thêm"} Chi Nhánh</PageTitle>
      <SectionTitle>Nhập thông tin chi nhánh</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          <Label>
            <span>Mã chi nhánh</span>
            <Input
              className="mt-1"
              {...formik.getFieldProps("branchCode")}
              disabled={!!id}
            />
          </Label>

          <Label className="mt-4">
            <span>Tên chi nhánh</span>
            <Input className="mt-1" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <HelperText valid={false}>{formik.errors.name}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Input className="mt-1" {...formik.getFieldProps("address")} />
            {formik.touched.address && formik.errors.address && (
              <HelperText valid={false}>{formik.errors.address}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Số điện thoại</span>
            <Input className="mt-1" {...formik.getFieldProps("phone")} />
            {formik.touched.phone && formik.errors.phone && (
              <HelperText valid={false}>{formik.errors.phone}</HelperText>
            )}
          </Label>

          {currentImg && (
            <div className="mt-4">
              <img
                src={`/${currentImg}`}
                alt="Branch"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
          )}

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
            <Select {...formik.getFieldProps("activeFlag")} className="mt-1">
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button
            className="p-4 mt-6"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Đang xử lý..."
              : id
              ? "Lưu chi nhánh"
              : "Thêm chi nhánh"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddBranch;
