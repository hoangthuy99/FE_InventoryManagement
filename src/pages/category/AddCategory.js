import { useFormik } from "formik";
import * as yup from "yup";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Textarea, Button } from "@windmill/react-ui";
import { categoryAPI } from "../../api/api";

function AddCategory() {
  const validationSchema = yup.object({
    name: yup.string().required("Tên danh mục không được để trống!"),
    description: yup.string().required("Mô tả không được để trống!"),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      description: "",
      activeFlag: 1,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await categoryAPI.create(values);
        showSuccessToast("Thêm danh mục thành công!");
        resetForm();
      } catch (error) {
        const msg = error.response?.data?.message || "Thêm danh mục thất bại!";
        if (msg.includes("Tên danh mục đã tồn tại")) {
          formik.setFieldError("name", msg);
        } else {
          showErrorToast(msg);
        }
      }
    },
  });

  return (
    <>
      <PageTitle>Thêm Danh Mục</PageTitle>
      <SectionTitle>Nhập thông tin danh mục</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          <Label>
            <span>Tên danh mục</span>
            <Input className="mt-1" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <HelperText valid={false}>{formik.errors.name}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Mô tả danh mục</span>
            <Textarea className="mt-1" {...formik.getFieldProps("description")} />
            {formik.touched.description && formik.errors.description && (
              <HelperText valid={false}>{formik.errors.description}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" {...formik.getFieldProps("activeFlag")}>
              <option value={1}>Hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Đang xử lý..." : "Thêm danh mục"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddCategory;
