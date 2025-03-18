import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import LocationPicker from "../../components/LocationPicker/LocationPicker";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Button } from "@windmill/react-ui";

import {
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import {
  orderAPI,
  customerAPI,
  branchAPI,
  orderDetailAPI,
  productAPI,
} from "../../api/api";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import data from "../../assets/data.json";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function EditOrder() {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const { orStatus, productUnit } = data;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const id = null;
  const schema = yup.object().shape({
    customerId: yup.number().required("Khách hàng là bắt buộc"),
    branchId: yup.number().required("Chi nhánh là bắt buộc"),
    status: yup.number().required("Chọn trạng thái"),
    product: yup
      .array()
      .of(
        yup.object().shape({
          productId: yup.string().required("Chọn sản phẩm"),
          unitPrice: yup.number().required("Giá không hợp lệ"),
          qty: yup
            .number()
            .min(1, "Số lượng tối thiểu là 1")
            .required("Nhập số lượng"),
          totalPrice: yup.number().required("Tổng tiền không hợp lệ"),
        })
      )
      .min(1, "Chọn ít nhất một sản phẩm"),
    plannedExportDate: yup
      .date()
      .min(new Date(), "Ngày xuất kho kế hoạch phải từ hôm nay trở đi")
      .required("Ngày xuất kho kế hoạch là bắt buộc"),
    actualExportDate: yup
      .date()
      .min(new Date(), "Ngày xuất kho thực tế phải từ hôm nay trở đi")
      .required("Ngày xuất kho thực tế là bắt buộc"),
    deliveryAddress: yup.string().required("Địa chỉ giao hàng là bắt buộc"),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [location, setLocation] = useState([10.7769, 106.7009]);
  const [markerPos, setMarkerPos] = useState([10.7769, 106.7009]);

  // Cập nhật địa chỉ khi chọn trên bản đồ
  const handleSelectAddress = (address, coords) => {
    setValue("deliveryAddress", address);
    setLocation(coords);
  };

  // Xử lý khi nhập địa chỉ vào input
  const handleInputChange = async (e, field) => {
    const address = e.target.value;
    field.onChange(address);
    setValue("deliveryAddress", address);

    if (address.length > 3) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
        );
        const data = await res.json();
        console.log("Kết quả từ API:", data); // Kiểm tra phản hồi từ API

        if (data.length > 0) {
          const { lat, lon } = data[0];
          const newLocation = [parseFloat(lat), parseFloat(lon)];
          setLocation(newLocation); // Cập nhật state location
        } else {
          console.error("Không tìm thấy địa chỉ!");
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm địa chỉ:", error);
      }
    }
  };

  useEffect(() => {
    if (typeof setValue === "function") {
      async function fetchData() {
        try {
          const total = orderDetails.reduce((acc, item) => {
            return acc + (item.unitPrice * item.qty || 0);
          }, 0);

          const [customerRes, branchRes, productRes] = await Promise.all([
            customerAPI.getAll(),
            branchAPI.getAll(),
            productAPI.getAll(),
          ]);

          setCustomers(customerRes.data || []);
          setBranches(branchRes.data || []);
          setProducts(productRes.data || []);

          setValue("totalPrice", total); // Gán giá trị cho totalPrice
        } catch (error) {
          console.error("Lỗi khi gọi API:", error);
          showErrorToast("Không thể tải dữ liệu!");
        }
      }
      fetchData();
    }
    if (location) {
      setMarkerPos(location);
    }
  }, [orderDetails, location]);

  const handleChangeProduct = (index, field, value) => {
    const updatedItems = [...orderDetails];
    updatedItems[index][field] = value;

    if (field === "productId") {
      const selectedProduct = products.find((p) => p.id === value);
      if (selectedProduct) {
        updatedItems[index].unitPrice = selectedProduct.price;
      }
    }
    // Kiểm tra nếu đã có `total` từ OrderDetail, ưu tiên sử dụng thay vì tính lại
    if (field === "qty" || field === "productId") {
      updatedItems[index].totalPrice =
        updatedItems[index].total ??
        (updatedItems[index].unitPrice || 0) * (updatedItems[index].qty || 0);
    }

    setOrderDetails(updatedItems);
  };

  const calculateTotalPrice = () => {
    return orderDetails.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handleAddItem = (item) => {
    setOrderDetails([...orderDetails, item]);
  };

  const handleRemoveItem = (index) => {
    setOrderDetails((items) => items.filter((_, i) => i !== index));
  };

  const submitForm = async (data) => {
    console.log(data);

    try {
      const totalPrice = calculateTotalPrice();
      const dataRequest = {
        customerId: data.customerId,
        branchId: data.branchId,
        plannedExportDate: data.plannedExportDate,
        actualExportDate: data.actualExportDate,
        deliveryAddress: data.deliveryAddress,
        totalPrice,
        status: data.status,
        note: data.note,
        orderDetailsRequest: orderDetails.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      };

      const res = await orderAPI.saveOrder(dataRequest);
      console.log(res);
      console.log("Địa chỉ:", data.deliveryAddress);
      console.log("Tọa độ:", location);
      if (res.status === 200) {
        showSuccessToast("Tạo đơn hàng thành công");
      } else {
        showErrorToast("Lỗi khi tạo đơn hàng");
      }
    } catch (error) {
      showErrorToast("Lỗi khi tạo đơn hàng");
    }
  };

  return (
    <>
      <SectionTitle>Thêm Đơn Hàng</SectionTitle>
      <form onSubmit={handleSubmit(submitForm)}>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.customerId}>
              <InputLabel>Khách hàng</InputLabel>
              <Select
                value={field.value || ""}
                onChange={field.onChange}
                label="Khách hàng"
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.customerId?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="branchId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.branchId}>
              <InputLabel>Chi nhánh</InputLabel>
              <Select
                value={field.value || ""}
                onChange={field.onChange}
                label="Chi nhánh"
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.branchId?.message}</FormHelperText>
            </FormControl>
          )}
        />
        <Controller
          name="plannedExportDate"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.plannedExportDate}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Ngày xuất kho kế hoạch"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={field.onChange}
                  timezone="America/New_York"
                />
              </LocalizationProvider>
              <FormHelperText>
                {errors.plannedExportDate?.message}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="actualExportDate"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Ngày xuất kho thực tế"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={field.onChange}
                />
              </LocalizationProvider>
            </FormControl>
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.status}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={field.value || ""}
                onChange={field.onChange}
                label="Chọn trạng thái"
              >
                {orStatus.map((status) => (
                  <MenuItem key={status.key} value={status.key}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.status?.message}</FormHelperText>
            </FormControl>
          )}
        />
        <Controller
          name="deliveryAddress"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <TextField
                {...field}
                placeholder="Nhập địa chỉ"
                onChange={(e) => handleInputChange(e, field)}
                error={!!errors.deliveryAddress}
                helperText={errors.deliveryAddress?.message}
              />
              <FormHelperText>
                Bạn có thể nhập địa chỉ hoặc chọn trên bản đồ
              </FormHelperText>
            </FormControl>
          )}
        />

        <LocationPicker
          location={location}
          onSelectAddress={handleSelectAddress}
        />

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.note}>
              <TextField
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Ghi chú giành cho đơn hàng"
                multiline
                rows={4}
                variant="outlined"
              />
              <FormHelperText>{errors.note?.message}</FormHelperText>
            </FormControl>
          )}
        />
        <Controller
          name="totalPrice"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.totalPrice}>
              <TextField
                value={field.value || ""}
                onChange={field.onChange}
                placeholder="Tổng tiền"
                disabled
              />
              <FormHelperText>{errors.totalPrice?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {/* {userRole === "admin" && (
          <Controller
            name="users"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.users}
              >
                <InputLabel>Người phụ trách</InputLabel>
                <Select {...field} label="Người phụ trách">
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.users?.message}</FormHelperText>
              </FormControl>
            )}
          />
        )} */}

        <SectionTitle>Chi tiết xuất kho</SectionTitle>
        <div className="px-4 py-3 mb-8 rounded-lg shadow-md dark:bg-gray-800">
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className="border border-gray-600 ">
                    <Button
                      size="small"
                      variant="contained"
                      color=""
                      onClick={() => {
                        handleAddItem({
                          productId: "",
                          quantity: 0,
                        });
                      }}
                    >
                      <AddCircleOutlineIcon />
                    </Button>
                  </TableCell>
                  <TableCell className="border border-gray-600 " width="15%">
                    Sản phẩm
                  </TableCell>
                  <TableCell className="border border-gray-600 " width="15%">
                    Đơn giá
                  </TableCell>
                  <TableCell className="border border-gray-600 " width="15%">
                    Số lương
                  </TableCell>
                  <TableCell className="border border-gray-600 ">
                    Đơn vị
                  </TableCell>
                  <TableCell className="border border-gray-600 ">
                    Tổng tiền
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetails.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="border border-gray-600 ">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <RemoveCircleOutlineIcon />
                      </Button>
                    </TableCell>
                    <TableCell className="border border-gray-600 ">
                      <FormControl fullWidth>
                        <InputLabel>Chọn sản phẩm</InputLabel>
                        <Select
                          value={item.productId || ""}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "productId",
                              e.target.value
                            )
                          }
                          label="Chọn sản phẩm"
                          className="border border-gray-600"
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell className="border border-gray-600 ">
                      <TextField
                        type="number"
                        size="small"
                        value={item.unitPrice || 0}
                        fullWidth
                        disabled
                      />
                    </TableCell>

                    <TableCell className="border border-gray-600 ">
                      <TextField
                        type="number"
                        size="small"
                        defaultValue={0}
                        value={item.qty}
                        onChange={(e) =>
                          handleChangeProduct(index, "qty", e.target.value)
                        }
                        fullWidth
                        inputProps={{
                          className: " border border-gray-600",
                        }}
                      />
                    </TableCell>
                    <TableCell className="border border-gray-600 ">
                      <FormControl fullWidth>
                        <InputLabel>Chọn đơn vị</InputLabel>
                        <Select
                          value={item.productUnit || ""}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "productUnit",
                              e.target.value
                            )
                          }
                          label="Chọn đơn vị"
                          className="border border-gray-600"
                        >
                          {productUnit.map((unit) => (
                            <MenuItem key={unit.key} value={unit.key}>
                              {unit.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell className="border border-gray-600 ">
                      {item?.totalPrice
                        ? Number(item.totalPrice).toLocaleString()
                        : "0"}{" "}
                      VNĐ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <Button type="submit" disabled={loading} className="w-1/6 mt-4">
          {loading ? "Đang xử lý..." : id ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </form>
    </>
  );
}

export default EditOrder;
