import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useParams, useHistory } from "react-router-dom";
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
import { productAPI, categoryAPI } from "../../api/api"; // Đảm bảo import categoryAPI

function AddProduct() {
  const { id } = useParams();
  const history = useHistory();
  const [img, setImage] = useState(null);
  const [currentImg, setCurrentImg] = useState(null);
  const [categories, setCategories] = useState([]); // Thêm state danh mục

  const validationSchema = yup.object({
    name: yup.string().required("Tên sản phẩm không được để trống!"),
    code: yup.string().required("Mã sản phẩm không được để trống!"),
    price: yup
      .number()
      .typeError("Giá phải là số")
      .required("Giá không được để trống!"),
    qty: yup
      .number()
      .typeError("Số lượng phải là số")
      .required("Số lượng không được để trống!"),
    categoryId: yup.string().required("Vui lòng chọn danh mục!"), //  Bắt buộc chọn danh mục
    description: yup.string(),
    activeFlag: yup.number().oneOf([0, 1], "Trạng thái không hợp lệ"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      code: "",
      price: "",
      qty: "",
      description: "",
      activeFlag: 1,
      categoryId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          formData.append(key, String(val));
        });
        if (img) {
          formData.append("img", img);
        }

        let res;
        if (id) {
          res = await productAPI.update(id, formData);
        } else {
          res = await productAPI.create(formData);
        }

        showSuccessToast(
          id ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!"
        );
        history.push("/app/product/all-product");
      } catch (error) {
        const msg = error.response?.data || "Thao tác thất bại!";
        if (typeof msg === "string") {
          if (msg.includes("mã sản phẩm")) {
            formik.setFieldError("code", msg);
          } else if (msg.includes("tên sản phẩm")) {
            formik.setFieldError("name", msg);
          } else {
            showErrorToast(msg);
          }
        } else {
          showErrorToast("Có lỗi xảy ra khi xử lý dữ liệu!");
        }
      }
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCategories(res.data || []);
      } catch {
        showErrorToast("Không thể tải danh mục!");
      }
    };
    fetchCategories();

    const fetchData = async () => {
      if (!id) return;
      try {
        const res = await productAPI.getById(id);
        const data = res.data;
        formik.setValues({
          name: data.name || "",
          code: data.code || "",
          price: data.price || "",
          qty: data.qty || "",
          categoryId: data.categoryId ? String(data.categoryId) : "",
          description: data.description || "",
          activeFlag: data.activeFlag ?? 1,
        });
        setCurrentImg(data.img || null);
      } catch {
        showErrorToast("Không thể tải dữ liệu sản phẩm!");
      }
    };
    fetchData();
  }, [id]);

  return (
    <>
      <PageTitle>{id ? "Chỉnh sửa" : "Thêm"} Sản Phẩm</PageTitle>
      <SectionTitle>Nhập thông tin sản phẩm</SectionTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <form onSubmit={formik.handleSubmit}>
          <Label>
            <span>Tên sản phẩm</span>
            <Input className="mt-1" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <HelperText valid={false}>{formik.errors.name}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Mã sản phẩm</span>
            <Input
              className="mt-1"
              {...formik.getFieldProps("code")}
              disabled={!id}
            />
            {formik.touched.code && formik.errors.code && (
              <HelperText valid={false}>{formik.errors.code}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Giá</span>
            <Input
              type="number"
              className="mt-1"
              {...formik.getFieldProps("price")}
            />
            {formik.touched.price && formik.errors.price && (
              <HelperText valid={false}>{formik.errors.price}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Số lượng</span>
            <Input
              type="number"
              className="mt-1"
              {...formik.getFieldProps("qty")}
            />
            {formik.touched.qty && formik.errors.qty && (
              <HelperText valid={false}>{formik.errors.qty}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Danh mục</span>
            <Select className="mt-1" {...formik.getFieldProps("categoryId")}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </Select>

            {formik.touched.categoryId && formik.errors.categoryId && (
              <HelperText valid={false}>{formik.errors.categoryId}</HelperText>
            )}
          </Label>

          <Label className="mt-4">
            <span>Mô tả sản phẩm</span>
            <Textarea
              className="mt-1"
              {...formik.getFieldProps("description")}
            />
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

          {currentImg && (
            <div className="mt-4">
              <img
                src={`/${currentImg}`}
                alt="Product"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            </div>
          )}

          <Label className="mt-4">
            <span>Hình ảnh sản phẩm</span>
            <Input
              type="file"
              className="mt-1"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Label>

          <Button
            className="p-4 mt-6"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Đang xử lý..."
              : id
              ? "Lưu sản phẩm"
              : "Thêm sản phẩm"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;
