import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Textarea, Button } from "@windmill/react-ui";
import { userAPI } from "../../api/api";

const validationSchema = yup.object({
  username: yup.string().required("Tên đăng nhập không được để trống!"),
  email: yup.string().email("Email không hợp lệ!").required("Email không được để trống!"),
  phone: yup.string().matches(/^\d{10,15}$/, "Số điện thoại phải có từ 10 đến 15 số!").required("Số điện thoại không được để trống!"),
  address: yup.string().required("Địa chỉ không được để trống!"),
  password: yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự!").required("Mật khẩu không được để trống!"),
  activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ").required("Trạng thái không được để trống!"),
});

function EditUser() {
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      activeFlag: 1,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await userAPI.add(values);
        showSuccessToast("Thêm người dùng thành công!");
        resetForm();
      } catch (error) {
        showErrorToast(error.response?.data?.message || "Thêm người dùng thất bại!");
      }
    },
  });

  return (
    <>
      <PageTitle>Thêm Người Dùng</PageTitle>
      <SectionTitle>Nhập thông tin người dùng</SectionTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          <Label>
            <span>Tên đăng nhập</span>
            <Input className="mt-1" type="text" name="username" {...formik.getFieldProps("username")} />
            {formik.touched.username && formik.errors.username && <HelperText valid={false}>{formik.errors.username}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Email</span>
            <Input className="mt-1" type="email" name="email" {...formik.getFieldProps("email")} />
            {formik.touched.email && formik.errors.email && <HelperText valid={false}>{formik.errors.email}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Số điện thoại</span>
            <Input className="mt-1" type="text" name="phone" {...formik.getFieldProps("phone")} />
            {formik.touched.phone && formik.errors.phone && <HelperText valid={false}>{formik.errors.phone}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Textarea className="mt-1" name="address" {...formik.getFieldProps("address")} />
            {formik.touched.address && formik.errors.address && <HelperText valid={false}>{formik.errors.address}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mật khẩu</span>
            <Input className="mt-1" type="password" name="password" {...formik.getFieldProps("password")} />
            {formik.touched.password && formik.errors.password && <HelperText valid={false}>{formik.errors.password}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" name="activeFlag" {...formik.getFieldProps("activeFlag")}
              onChange={(e) => formik.setFieldValue("activeFlag", Number(e.target.value))}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Đang xử lý..." : "Thêm người dùng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditUser;

