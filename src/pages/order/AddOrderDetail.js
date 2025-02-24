import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Button } from "@windmill/react-ui";
import { orderDetailAPI} from "../../api/api";

function OrderDetail() {
  const [formData, setFormData] = useState({
    orderId: "",
    productId: "",
    quantity: 1,
    price: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.orderId.trim()) newErrors.orderId = "Mã đơn hàng không được để trống!";
    if (!formData.productId.trim()) newErrors.productId = "Mã sản phẩm không được để trống!";
    if (formData.quantity <= 0) newErrors.quantity = "Số lượng phải lớn hơn 0!";
    if (!formData.price.trim() || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Giá phải là số hợp lệ và lớn hơn 0!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;
    setLoading(true);

    try {
      await orderDetailAPI.create(formData);
      showSuccessToast("Thêm chi tiết đơn hàng thành công!");
      setFormData({ orderId: "", productId: "", quantity: 1, price: "" });
    } catch (error) {
      let errorMessage = "Thêm chi tiết đơn hàng thất bại!";
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      setErrors({ general: errorMessage });
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle>Thêm Chi Tiết Đơn Hàng</PageTitle>
      
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && <HelperText valid={false}>{errors.general}</HelperText>}
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Mã đơn hàng</span>
            <Input className="mt-1" type="text" name="orderId" value={formData.orderId} onChange={handleChange} />
            {errors.orderId && <HelperText valid={false}>{errors.orderId}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mã sản phẩm</span>
            <Input className="mt-1" type="text" name="productId" value={formData.productId} onChange={handleChange} />
            {errors.productId && <HelperText valid={false}>{errors.productId}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Số lượng</span>
            <Input className="mt-1" type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
            {errors.quantity && <HelperText valid={false}>{errors.quantity}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Giá</span>
            <Input className="mt-1" type="text" name="price" value={formData.price} onChange={handleChange} />
            {errors.price && <HelperText valid={false}>{errors.price}</HelperText>}
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm chi tiết đơn hàng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default OrderDetail;
