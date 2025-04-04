import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Button } from "@windmill/react-ui";
import { menuAPI, roleAPI } from "../../api/api";
import { useParams, useHistory } from "react-router-dom";

function EditMenu() {
  const { id } = useParams();
  const history = useHistory();
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);

  const validationSchema = yup.object({
    code: yup.string().required("Mã menu không được để trống!"),
    name: yup.string().required("Tên menu không được để trống!"),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ"),
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      path: "",
      icon: "",
      parentId: "",
      activeFlag: 1,
      roleIds: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = id
          ? await menuAPI.update(id, values)
          : await menuAPI.create(values);

        if (response.data) {
          showSuccessToast(id ? "Cập nhật menu thành công!" : "Thêm menu thành công!");
          history.push("/app/menus/all-menu");
        } else {
          showErrorToast("API không trả về dữ liệu hợp lệ!");
        }
      } catch (error) {
        showErrorToast(error.message || "Thao tác thất bại!");
      }
    },
  });

  const handleRoleChange = (roleId) => {
    const updatedRoleIds = formik.values.roleIds.includes(roleId)
      ? formik.values.roleIds.filter((id) => id !== roleId)
      : [...formik.values.roleIds, roleId];

    formik.setFieldValue("roleIds", updatedRoleIds);
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [menuListRes, roleListRes] = await Promise.all([
          menuAPI.getAll(),
          roleAPI.getAllRoles(),
        ]);

        setMenus(menuListRes.data || []);
        setRoles(roleListRes.data?.data || []);

        if (id) {
          const menuRes = await menuAPI.getById(id);
          const data = menuRes.data;

          const extractedRoleIds = data.roles?.map((r) => r.id) || data.roleIds || [];

          formik.setValues({
            code: data.code || "",
            name: data.name || "",
            path: data.path || "",
            icon: data.icon || "",
            parentId: data.parentId || "",
            activeFlag: data.activeFlag ?? 1,
            roleIds: extractedRoleIds,
          });
        }
      } catch (error) {
        showErrorToast("Lỗi khi tải dữ liệu!");
      }
    };

    initData();
  }, [id]);

  return (
    <>
      <PageTitle>{id ? "Sửa" : "Thêm"} Menu</PageTitle>
      <SectionTitle>Nhập thông tin menu</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          {/* Mã menu */}
          <Label>
            <span>Mã Menu</span>
            <Input className="mt-1" {...formik.getFieldProps("code")} />
            {formik.touched.code && formik.errors.code && (
              <HelperText valid={false}>{formik.errors.code}</HelperText>
            )}
          </Label>

          {/* Tên menu */}
          <Label className="mt-4">
            <span>Tên Menu</span>
            <Input className="mt-1" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <HelperText valid={false}>{formik.errors.name}</HelperText>
            )}
          </Label>

          {/* Đường dẫn */}
          <Label className="mt-4">
            <span>Đường Dẫn</span>
            <Input className="mt-1" {...formik.getFieldProps("path")} />
            {formik.touched.path && formik.errors.path && (
              <HelperText valid={false}>{formik.errors.path}</HelperText>
            )}
          </Label>

          {/* Icon & Trạng thái */}
          <div className="flex flex-col gap-4 mt-4 md:flex-row">
            <Label className="w-full md:w-1/2">
              <span>Icon</span>
              <Input className="mt-1" {...formik.getFieldProps("icon")} />
              {formik.touched.icon && formik.errors.icon && (
                <HelperText valid={false}>{formik.errors.icon}</HelperText>
              )}
            </Label>

            <Label className="w-full md:w-1/2">
              <span>Trạng thái</span>
              <select
                className="w-full p-2 mt-1 border rounded"
                {...formik.getFieldProps("activeFlag")}
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Không hoạt động</option>
              </select>
              {formik.touched.activeFlag && formik.errors.activeFlag && (
                <HelperText valid={false}>{formik.errors.activeFlag}</HelperText>
              )}
            </Label>
          </div>

          {/* Vai trò */}
          <Label className="mt-6">
            <span className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
              Vai trò
            </span>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 gap-y-3">
              {roles.map((role) => (
                <Label key={role.id} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 border-gray-300 form-checkbox focus:ring focus:ring-purple-300"
                    value={role.id}
                    checked={formik.values.roleIds.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                  />
                  <span className="ml-2 text-sm text-gray-800 dark:text-gray-100">
                    {role.roleName}
                  </span>
                </Label>
              ))}
            </div>
            {formik.touched.roleIds && formik.errors.roleIds && (
              <HelperText valid={false}>{formik.errors.roleIds}</HelperText>
            )}
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Đang xử lý..." : id ? "Lưu Menu" : "Thêm Menu"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditMenu;