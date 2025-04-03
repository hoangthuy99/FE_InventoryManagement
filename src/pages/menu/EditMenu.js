import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Button } from "@windmill/react-ui";
import { menuAPI, roleAPI } from "../../api/api"; // Import API
import { useParams, useHistory } from "react-router-dom";

function EditMenu() {
  const { id } = useParams(); // Lấy ID từ URL
  const history = useHistory();
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]); 

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await menuAPI.getAll();
        setMenus(response.data || []);
      } catch (error) {
        showErrorToast("Lỗi khi tải danh sách menu!");
      }
    };

   const fetchRoles = async () => {
      try {
        const response = await roleAPI.getAllRoles();
        const data = response.data?.data;
  
        if (data) {
          setRoles(data);
        }
      } catch (error) {
        showErrorToast(error.message || "Lỗi khi tải nhà cung cấp!");
      }
    };
    fetchMenus();
    fetchRoles();

    if (id) {
      const fetchMenu = async () => {
        try {
          const response = await menuAPI.getById(id);
          if (response.data) {
            formik.setValues(response.data);
          }
        } catch (error) {
          showErrorToast("Lỗi khi tải thông tin menu!");
        }
      };
      fetchMenu();
    }
  }, [id]);

  const validationSchema = yup.object({
    code: yup.string().required("Mã menu không được để trống!"),
    name: yup.string().required("Tên menu không được để trống!"),
    icon: yup.string().required("Icon không được để trống!"),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ"),
    roleId: yup.string().required("Vui lòng chọn quyền!"),
  });

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      path: "",
      icon: "",
      parentId: "",
      activeFlag: 1,
      roleId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
        try {
          console.log("Submitting values:", values); // Log giá trị trước khi gửi API
          const response = id ? await menuAPI.update(id, values) : await menuAPI.create(values);
          console.log("API response:", response); // Kiểm tra dữ liệu trả về từ API
      
          if (response.data?.data) {
            showSuccessToast(id ? "Cập nhật menu thành công!" : "Thêm menu thành công!");
            history.push("/app/menu");
          } else {
            showErrorToast("API không trả về dữ liệu hợp lệ!");
          }
        } catch (error) {
          console.error("API Error:", error);
          showErrorToast(error.message || "Thao tác thất bại!");
        }
      }
      
  });

  return (
    <>
      <PageTitle>{id ? "Sửa" : "Thêm"} Menu</PageTitle>
      <SectionTitle>Nhập thông tin menu</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          {/* Mã menu */}
          <Label>
            <span>Mã Menu</span>
            <Input 
              className="mt-1"
              {...formik.getFieldProps("code")}
            />
            {formik.touched.code && formik.errors.code && (
              <HelperText valid={false}>{formik.errors.code}</HelperText>
            )}
          </Label>

          {/* Tên menu */}
          <Label className="mt-4">
            <span>Tên Menu</span>
            <Input 
              className="mt-1"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <HelperText valid={false}>{formik.errors.name}</HelperText>
            )}
          </Label>

          {/* Đường dẫn */}
          <Label className="mt-4">
            <span>Đường Dẫn</span>
            <Input 
              className="mt-1"
              {...formik.getFieldProps("path")}
            />
            {formik.touched.path && formik.errors.path && (
              <HelperText valid={false}>{formik.errors.path}</HelperText>
            )}
          </Label>

          {/* Icon */}
          <Label className="mt-4">
            <span>Icon</span>
            <Input 
              className="mt-1"
              {...formik.getFieldProps("icon")}
            />
            {formik.touched.icon && formik.errors.icon && (
              <HelperText valid={false}>{formik.errors.icon}</HelperText>
            )}
          </Label>

          {/* Trạng thái */}
          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select 
              className="mt-1"
              {...formik.getFieldProps("activeFlag")}
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
            {formik.touched.activeFlag && formik.errors.activeFlag && (
              <HelperText valid={false}>{formik.errors.activeFlag}</HelperText>
            )}
          </Label>

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

          <Button className="p-4 mt-6" type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Đang xử lý..." : id ? "Lưu Menu" : "Thêm Menu"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default EditMenu;
