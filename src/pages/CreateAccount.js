import React from "react";
import { Link, useHistory } from "react-router-dom";
import ImageLight from "../assets/img/create-account-office.jpeg";
import ImageDark from "../assets/img/create-account-office-dark.jpeg";
import { Input, Label, Button } from "@windmill/react-ui";
import { authAPI } from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../components/Toast";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function Register() {
  const { login } = useAuth();
  const history = useHistory();

  const formik = useFormik({
    initialValues: {
      username: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      userCode: Yup.string().required("Vui lòng nhập mã người dùng"),
      fullName: Yup.string().required("Vui lòng nhập họ và tên"),
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
      phone: Yup.string()
        .matches(/^(0[0-9]{9,10})$/, "Số điện thoại không hợp lệ")
        .required("Vui lòng nhập số điện thoại"),
      address: Yup.string().required("Vui lòng nhập địa chỉ"),
      password: Yup.string()
        .min(6, "Mật khẩu ít nhất 6 ký tự")
        .required("Vui lòng nhập mật khẩu"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
        .required("Vui lòng xác nhận mật khẩu"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await authAPI.register(values);
        if (res.status === 200 && res.data?.code === 200) {
          showSuccessToast("Đăng ký thành công!");
          history.push("/login");
        } else {
          throw new Error(res.data?.message);
        }
      } catch (error) {
        showErrorToast(error.message);
      }
    },
  });

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await authAPI.registerOauth(response.credential);
      if (res.status === 200 && res.data?.code === 200) {
        const { exp } = jwtDecode(response.credential);
        const token = JSON.stringify({
          accessToken: response.credential,
          expiration: exp,
        });
        login(token);
        history.push("/app/dashboard");
        showSuccessToast("Đăng ký thành công với Google");
      } else {
        throw new Error(res.data?.message);
      }
    } catch (error) {
      showWarningToast(error.message);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col md:flex-row">
          <div className="h-32 md:h-auto md:w-1/2">
            <img
              className="object-cover w-full h-full dark:hidden"
              src={ImageLight}
              alt="Office"
            />
            <img
              className="hidden object-cover w-full h-full dark:block"
              src={ImageDark}
              alt="Office"
            />
          </div>
          <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
            <div className="w-full">
              <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
                Tạo tài khoản
              </h1>
              <form onSubmit={formik.handleSubmit}>
                {/* Mã người dùng */}
                <Label>
                  <span>Tên người dùng</span>
                  <Input
                    className="mt-1"
                    type="text"
                    name="username"
                    placeholder="Nhập người dùng"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="text-sm text-red-500">
                      {formik.errors.username}
                    </p>
                  )}
                </Label>

                {/* Họ và tên */}
                <Label className="mt-4">
                  <span>Họ và tên</span>
                  <Input
                    className="mt-1"
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-sm text-red-500">
                      {formik.errors.fullName}
                    </p>
                  )}
                </Label>

                {/* Email */}
                <Label className="mt-4">
                  <span>Email</span>
                  <Input
                    className="mt-1"
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </Label>

                {/* Số điện thoại */}
                <Label className="mt-4">
                  <span>Số điện thoại</span>
                  <Input
                    className="mt-1"
                    type="text"
                    name="phone"
                    placeholder="0123456789"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-sm text-red-500">
                      {formik.errors.phone}
                    </p>
                  )}
                </Label>

                {/* Địa chỉ */}
                <Label className="mt-4">
                  <span>Địa chỉ</span>
                  <Input
                    className="mt-1"
                    type="text"
                    name="address"
                    placeholder="123 Đường ABC, Quận XYZ"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.address && formik.errors.address && (
                    <p className="text-sm text-red-500">
                      {formik.errors.address}
                    </p>
                  )}
                </Label>

                {/* Mật khẩu */}
                <Label className="mt-4">
                  <span>Mật khẩu</span>
                  <Input
                    className="mt-1"
                    type="password"
                    name="password"
                    placeholder="********"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-500">
                      {formik.errors.password}
                    </p>
                  )}
                </Label>
                {/* Xác nhận mật khẩu */}
                <Label className="mt-4">
                  <span>Xác nhận mật khẩu</span>
                  <Input
                    className="mt-1"
                    type="password"
                    name="confirmPassword"
                    placeholder="********"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {formik.errors.confirmPassword}
                      </p>
                    )}
                </Label>

                <Button type="submit" block className="mt-4">
                  Đăng ký
                </Button>
              </form>

              <hr className="my-8" />
              <GoogleLogin
                clientId={CLIENT_ID}
                onSuccess={handleGoogleSuccess}
              />
              <p className="mt-4">
                <Link
                  className="text-sm text-purple-600 hover:underline"
                  to="/login"
                >
                  Đã có tài khoản? Đăng nhập ngay
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Register;
