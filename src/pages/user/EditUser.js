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

import { authAPI, userAPI, roleAPI } from "../../api/api";

import { useParams } from "react-router-dom/cjs/react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function EditUser() {
  const { id } = useParams();
  const history = useHistory();
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getAllRoles();

      const data = response.data?.data;
      console.log(data);

      if (data) {
        setRoles(data);
      }
    } catch (error) {
      showErrorToast(error.message || "Lỗi khi tải nhà cung cấp!");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await userAPI.getById(id);
      const data = response.data?.data;
      console.log(data);

      if (data) {
        formik.setValues({
          username: "00000000",
          fullname: data.fullname,
          email: data.email,
          phone: data.phone,
          address: data.address,
          password: "00000000",
          confirmPassword: "00000000",
          activeFlag: data.activeFlag,
          roleId: data.roles[0]?.id,
        });
      }
    } catch (error) {
      showErrorToast(error.message || "Lỗi khi tải nhà cung cấp!");
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
    fetchRoles();
  }, []);

  const validationSchema = yup.object({
    username: yup.string().required("Tên đăng nhập không được để trống!"),
    fullname: yup.string().required("Fullname không được để trống!"),
    email: yup
      .string()
      .email("Email không hợp lệ!")
      .required("Email không được để trống!"),
    phone: yup
      .string()
      .matches(/^\d{10,15}$/, "Số điện thoại phải có từ 10 đến 15 số!")
      .required("Số điện thoại không được để trống!"),
    address: yup.string().required("Địa chỉ không được để trống!"),
    password: yup
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự!")
      .required("Mật khẩu không được để trống!"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Mật khẩu nhập lại không khớp!")
      .required("Mật khẩu xác nhận không được để trống!"),
    activeFlag: yup
      .number()
      .oneOf([0, 1], "Trạng thái không hợp lệ")
      .required("Trạng thái không được để trống!"),
    roleId: yup
      .number()
      .oneOf([...roles.map((r) => r.id)], "Vai trò không hợp lệ")
      .required("Vai trò không được để trống!"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      fullname: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      activeFlag: 1,
      roleId: roles[0]?.id,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const requestData = {
          ...values,
          userCode:
            values.fullname.charAt(0).toUpperCase() +
            values.fullname.split("", 1) +
            (Math.random() * 10000).toString().slice(0, 3),
        };

        let reponse;

        if (id) {
          reponse = await userAPI.update(id, values);
          const data = reponse.data?.data;
          if (data) {
            showSuccessToast("Lưu người dùng thành công!");
            history.push("/app/user/all-user");
          }
        } else {
          reponse = await authAPI.register(requestData);
          const data = reponse.data?.data;
          if (data) {
            showSuccessToast("Thêm người dùng thành công!");
            resetForm();
          }
        }
      } catch (error) {
        showErrorToast(
          error.response?.data?.message || "Thêm người dùng thất bại!"
        );
      }
    },
  });

  return (
    <>
      <PageTitle>{id == null ? "Thêm" : "Sửa"} Người Dùng</PageTitle>
      <SectionTitle>Nhập thông tin người dùng</SectionTitle>

      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          <Label>
            <span>Họ và tên</span>
            <Input
              className="mt-1"
              type="text"
              name="fullname"
              {...formik.getFieldProps("fullname")}
            />
            {formik.touched.fullname && formik.errors.fullname && (
              <HelperText valid={false}>{formik.errors.fullname}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Email</span>
            <Input
              className="mt-1"
              type="email"
              name="email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <HelperText valid={false}>{formik.errors.email}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Số điện thoại</span>
            <Input
              className="mt-1"
              type="text"
              name="phone"
              {...formik.getFieldProps("phone")}
            />
            {formik.touched.phone && formik.errors.phone && (
              <HelperText valid={false}>{formik.errors.phone}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Địa chỉ</span>
            <Textarea
              className="mt-1"
              name="address"
              {...formik.getFieldProps("address")}
            />
            {formik.touched.address && formik.errors.address && (
              <HelperText valid={false}>{formik.errors.address}</HelperText>
            )}
          </Label>

          {id == null && (
            <>
              <Label className="mt-4">
                <span>Tên đăng nhập</span>
                <Input
                  className="mt-1"
                  type="text"
                  name="username"
                  {...formik.getFieldProps("username")}
                />
                {formik.touched.username && formik.errors.username && (
                  <HelperText valid={false}>
                    {formik.errors.username}
                  </HelperText>
                )}
              </Label>

              <Label className="mt-4">
                <span>Mật khẩu</span>
                <Input
                  className="mt-1"
                  type="password"
                  name="password"
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password && (
                  <HelperText valid={false}>
                    {formik.errors.password}
                  </HelperText>
                )}
              </Label>

              <Label className="mt-4">
                <span>Xác nhận mật khẩu</span>
                <Input
                  className="mt-1"
                  type="password"
                  name="password"
                  {...formik.getFieldProps("confirmPassword")}
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <HelperText valid={false}>
                      {formik.errors.confirmPassword}
                    </HelperText>
                  )}
              </Label>
            </>
          )}

          <Label className="mt-4">
            <span>Vai trò</span>
            <Select
              className="mt-1"
              name="roleId"
              {...formik.getFieldProps("roleId")}
              onChange={(e) =>
                formik.setFieldValue("roleId", Number(e.target.value))
              }
            >
              {roles.map((r) => {
                return <option value={r.id}>{r.roleName}</option>;
              })}
            </Select>
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select
              className="mt-1"
              name="activeFlag"
              {...formik.getFieldProps("activeFlag")}
              onChange={(e) =>
                formik.setFieldValue("activeFlag", Number(e.target.value))
              }
            >
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
              : id == null
              ? "Thêm người dùng"
              : "Lưu người dùng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditUser;
