import { useEffect, useState } from "react";
import { useFormik } from "formik";
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

import { userAPI, roleAPI } from "../../api/api";
import { useParams, useHistory } from "react-router-dom";

function EditUser() {
  const { id } = useParams();
  const history = useHistory();
  const isEditMode = !!id;
  const [roles, setRoles] = useState([]);
  const [initialValues, setInitialValues] = useState({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    activeFlag: 1,
    roleId: "",
  });

  // Schema dùng riêng cho chế độ thêm
  const createValidationSchema = yup.object({
    username: yup.string().required("Tên đăng nhập không được để trống!"),
    fullname: yup.string().required("Họ và tên không được để trống!"),
    email: yup.string().email("Email không hợp lệ!").required("Email không được để trống!"),
    phone: yup.string().matches(/^\d{10,15}$/, "Số điện thoại phải từ 10-15 số!")
      .required("Số điện thoại không được để trống!"),
    address: yup.string().required("Địa chỉ không được để trống!"),
    password: yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự!")
      .required("Mật khẩu không được để trống!"),
    confirmPassword: yup.string().oneOf([yup.ref("password")], "Mật khẩu nhập lại không khớp!")
      .required("Mật khẩu xác nhận không được để trống!"),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ")
      .required("Trạng thái không được để trống!"),
    
  });

  // Schema dùng cho cập nhật
  const editValidationSchema = yup.object({
    fullname: yup.string().required("Họ và tên không được để trống!"),
    email: yup.string().email("Email không hợp lệ!").required("Email không được để trống!"),
    phone: yup.string().matches(/^\d{10,15}$/, "Số điện thoại phải từ 10-15 số!")
      .required("Số điện thoại không được để trống!"),
    address: yup.string().required("Địa chỉ không được để trống!"),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ")
      .required("Trạng thái không được để trống!"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: isEditMode ? editValidationSchema : createValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const submitValues = { ...values };

        if (isEditMode) {
          delete submitValues.password;
          delete submitValues.confirmPassword;
          delete submitValues.username;

          await userAPI.update(id, submitValues);
          showSuccessToast("Lưu người dùng thành công!");
          history.push("/app/user/all-user");
        } else {
          await userAPI.create(submitValues);
          showSuccessToast("Thêm người dùng thành công!");
          resetForm();
        }
      } catch (error) {
        showErrorToast(
          error.response?.data?.message || "Thêm/Sửa người dùng thất bại!"
        );
      }
    },
  });

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getAllRoles();
      const data = response.data?.data;
      if (data) setRoles(data);
    } catch (error) {
      showErrorToast("Lỗi khi tải danh sách vai trò!");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await userAPI.getById(id);
      const data = response.data?.data;
      if (data) {
        setInitialValues({
          username: "********",
          fullname: data.fullname,
          email: data.email,
          phone: data.phone,
          address: data.address,
          password: "",
          confirmPassword: "",
          activeFlag: data.activeFlag,
          roleId: data.roles[0]?.id || "",
        });
      }
    } catch (error) {
      showErrorToast("Lỗi khi tải thông tin người dùng!");
    }
  };

  useEffect(() => {
    fetchRoles();
    if (isEditMode) fetchUser();
  }, []);

  return (
    <>
      <PageTitle>{isEditMode ? "Sửa" : "Thêm"} Người Dùng</PageTitle>
      <SectionTitle>Nhập thông tin người dùng</SectionTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          <Label>
            <span>Họ và tên</span>
            <Input className="mt-1" name="fullname" {...formik.getFieldProps("fullname")} />
            {formik.touched.fullname && formik.errors.fullname && (
              <HelperText valid={false}>{formik.errors.fullname}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Email</span>
            <Input className="mt-1" name="email" type="email" {...formik.getFieldProps("email")} />
            {formik.touched.email && formik.errors.email && (
              <HelperText valid={false}>{formik.errors.email}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Số điện thoại</span>
            <Input className="mt-1" name="phone" {...formik.getFieldProps("phone")} />
            {formik.touched.phone && formik.errors.phone && (
              <HelperText valid={false}>{formik.errors.phone}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Textarea className="mt-1" name="address" {...formik.getFieldProps("address")} />
            {formik.touched.address && formik.errors.address && (
              <HelperText valid={false}>{formik.errors.address}</HelperText>
            )}
          </Label>

          {!isEditMode && (
            <>
              <Label className="mt-4">
                <span>Tên đăng nhập</span>
                <Input className="mt-1" name="username" {...formik.getFieldProps("username")} />
                {formik.touched.username && formik.errors.username && (
                  <HelperText valid={false}>{formik.errors.username}</HelperText>
                )}
              </Label>

              <Label className="mt-4">
                <span>Mật khẩu</span>
                <Input
                  className="mt-1"
                  name="password"
                  type="password"
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password && (
                  <HelperText valid={false}>{formik.errors.password}</HelperText>
                )}
              </Label>

              <Label className="mt-4">
                <span>Xác nhận mật khẩu</span>
                <Input
                  className="mt-1"
                  name="confirmPassword"
                  type="password"
                  {...formik.getFieldProps("confirmPassword")}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <HelperText valid={false}>{formik.errors.confirmPassword}</HelperText>
                )}
              </Label>
            </>
          )}

          <Label className="mt-4">
            <span>Vai trò</span>
            <Select
              className="mt-1"
              name="roleId"
              value={formik.values.roleId}
              onChange={(e) => formik.setFieldValue("roleId", Number(e.target.value))}
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roleName}
                </option>
              ))}
            </Select>
            {formik.touched.roleId && formik.errors.roleId && (
              <HelperText valid={false}>{formik.errors.roleId}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select
              className="mt-1"
              name="activeFlag"
              value={formik.values.activeFlag}
              onChange={(e) => formik.setFieldValue("activeFlag", Number(e.target.value))}
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting
              ? "Đang xử lý..."
              : isEditMode
              ? "Lưu người dùng"
              : "Thêm người dùng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditUser;
