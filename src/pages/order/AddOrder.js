import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Button, Textarea } from "@windmill/react-ui";


import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import data from "../../assets/data.json";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const schema = yup.object().shape({
  orderCode: yup.string().required("Mã đơn hàng là bắt buộc"),
  customerId: yup.number().required("Khách hàng là bắt buộc"),
  branchId: yup.number().required("Chi nhánh là bắt buộc"),
  status: yup.string().required("Trạng thái là bắt buộc"),
  plannedExportDate: yup.date().required("Ngày xuất hàng là bắt buộc"),
});

function AddOrder() {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [page, setPage] = useState(1);
  const { gdrStatus, productUnit, stockStatus } = data;
  const resultsPerPage = 10;
  const [products, setProducts] = useState([]);
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    async function fetchData() {
      try {
        const [customerRes, branchRes] = await Promise.all([
          customerAPI.getAll(),
          branchAPI.getAll(),
        ]);
        console.log("Customers:", customerRes.data);
        console.log("Branches:", branchRes.data);

        setCustomers(customerRes.data || []);
        setBranches(branchRes.data || []);
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        showErrorToast("Không thể tải dữ liệu!");
      }
    }
    fetchData();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, [page]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderDetailAPI.getAllPaginated(
        page,
        resultsPerPage
      );
      setOrderDetails(response.data?.data || []);
    } catch (error) {
      showErrorToast("Lỗi khi tải dữ liệu chi tiết đơn hàng!");
    }
  };
  const handleChangeProduct = (index, field, value) => {
    const updateItems = [...orderDetails];
    updateItems[index][field] = value;
    setOrderDetails(updateItems);
  };

  const calculateTotalPrice = () => {
    return orderDetails.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity || 0);
    }, 0);
  };
  const handleAddItem = (item) => {
    setOrderDetails([...orderDetails, item]);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const handleRemoveItem = (index) => {
    setOrderDetails((items) => items.filter((_, i) => i !== index));
  };

  const submitForm = async (data) => {
    const totalPrice = calculateTotalPrice();
    console.log("Tổng tiền tự động tính:", totalPrice);

    try {
      const res = await orderAPI.saveOrder({
        customer: data.customerId,
        totalPrice,
        orderDetails,
      });

      if (res.status === 200) {
        showSuccessToast("Tạo đơn hàng thành công");
      }
    } catch (error) {
      console.error("Lỗi API:", error.response?.data || error.message);
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
              <Select {...field} label="Khách hàng">
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
              <Select {...field} label="Chi nhánh">
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
          name="userId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.userId}>
              <InputLabel>Người tạo</InputLabel>
              <Select {...field} label="Người tạo">
                {branches.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.userId?.message}</FormHelperText>
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
          name="deliveryAddress"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.deliveryAddress}
            >
              <Textarea {...field} placeholder="Địa chỉ giao hàng" />
              <FormHelperText>{errors.deliveryAddress?.message}</FormHelperText>
            </FormControl>
          )}
        />

        {userRole === "admin" && (
          <Controller
            name="inChargeUser"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.inChargeUser}
              >
                <InputLabel>Người phụ trách</InputLabel>
                <Select {...field} label="Người phụ trách">
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.inChargeUser?.message}</FormHelperText>
              </FormControl>
            )}
          />
        )}

        <Button type="submit">Lưu đơn hàng</Button>
      </form>

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
                  Đơn vị
                </TableCell>
                <TableCell className="border border-gray-600 " width="15%">
                  Số lương
                </TableCell>
                <TableCell className="border border-gray-600 ">
                  Đơn giá
                </TableCell>
                <TableCell className="border border-gray-600 ">
                  Tổng tiền
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderDetails?.map((item, index) => (
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
                      <InputLabel>Chọn product</InputLabel>
                      <Select
                        value={item.productId || ""}
                        onChange={(e) =>
                          handleChangeProduct(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        label="Chọn product"
                        className="border border-gray-600 "
                      >
                        {products?.map((product) => (
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
                      defaultValue={0}
                      value={productUnit.value}
                      onChange={(e) =>
                        handleChangeProduct(index, "product", e.target.value)
                      }
                      fullWidth
                      inputProps={{
                        className: " border border-gray-600",
                      }}
                    />
                  </TableCell>
                  <TableCell className="border border-gray-600 ">
                    <TextField
                      type="number"
                      size="small"
                      defaultValue={0}
                      value={item.price}
                      onChange={(e) =>
                        handleChangeProduct(index, "price", e.target.value)
                      }
                      fullWidth
                      inputProps={{
                        className: " border border-gray-600",
                      }}
                    />
                  </TableCell>
                

                  <TableCell className="border border-gray-600 ">
                    <TextField
                      type="number"
                      size="small"
                      defaultValue={0}
                      value={item.price}
                      onChange={(e) =>
                        handleChangeProduct(index, "price", e.target.value)
                      }
                      fullWidth
                      inputProps={{
                        className: " border border-gray-600",
                      }}
                    />
                  </TableCell>
                  <TableCell className="border border-gray-600 ">
                    {(
                      (item.price || 0) * (item.quantity || 0)
                    ).toLocaleString()}{" "}
                    VNĐ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}

export default AddOrder;
