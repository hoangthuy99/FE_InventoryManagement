import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, HelperText, Label, Select, Button } from "@windmill/react-ui";
import { orderAPI } from "../../api/api";

function AddOrder() {
  const [formData, setFormData] = useState({
    customerId: "",
    orderCode: "",
    totalPrice: "",
    status: "PENDING",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.customerId.trim()) newErrors.customerId = "Khách hàng không được để trống!";
    if (!formData.orderCode.trim()) {
      newErrors.orderCode = "Mã đơn hàng không được để trống!";
    } else if (!/^ORD\d{5}$/.test(formData.orderCode)) {
      newErrors.orderCode = "Mã đơn hàng phải có dạng ORDxxxxx (5 số)!";
    }
    if (!formData.totalPrice.trim() || isNaN(formData.totalPrice) || Number(formData.totalPrice) <= 0) {
      newErrors.totalPrice = "Tổng tiền phải là số dương!";
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
      await orderAPI.create(formData);
      showSuccessToast("Thêm đơn hàng thành công!");
      setFormData({ customerId: "", orderCode: "", totalPrice: "", status: "PENDING" });
    } catch (error) {
      let errorMessage = "Thêm đơn hàng thất bại!";
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
      <PageTitle>Thêm Đơn Hàng</PageTitle>
      <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        {errors.general && <HelperText valid={false}>{errors.general}</HelperText>}
        <form onSubmit={handleSubmit}>
          <Label>
            <span>Mã khách hàng</span>
            <Input className="mt-1" type="text" name="customerId" value={formData.customerId} onChange={handleChange} />
            {errors.customerId && <HelperText valid={false} className="mt-1">{errors.customerId}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Mã đơn hàng</span>
            <Input className="mt-1" type="text" name="orderCode" value={formData.orderCode} onChange={handleChange} />
            {errors.orderCode && <HelperText valid={false} className="mt-1">{errors.orderCode}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Tổng tiền</span>
            <Input className="mt-1" type="number" name="totalPrice" value={formData.totalPrice} onChange={handleChange} />
            {errors.totalPrice && <HelperText valid={false} className="mt-1">{errors.totalPrice}</HelperText>}
          </Label>

          <Label className="mt-4">
            <span>Trạng thái</span>
            <Select className="mt-1" name="status" value={formData.status} onChange={handleChange}>
              <option value="PENDING">Chờ xử lý</option>
              <option value="SHIPPED">Đã giao hàng</option>
              <option value="CANCELLED">Đã hủy</option>
            </Select>
          </Label>

          <Button className="p-4 mt-6" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Thêm đơn hàng"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddOrder;
