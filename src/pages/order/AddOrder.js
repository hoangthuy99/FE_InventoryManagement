import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Button } from "@windmill/react-ui";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  Box,
  Typography,
  IconButton,
  Modal,
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
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;
  const { gdrStatus, productUnit, stockStatus } = data;
  const [products, setProducts] = useState([]);

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

  const fetchAllProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  return (
    <>
      <SectionTitle>Thêm Đơn Hàng</SectionTitle>
      <form
        onSubmit={handleSubmit(submitForm)}
        className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800"
      >
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.customerId}>
              <InputLabel>Khách hàng</InputLabel>
              <Select {...field}>
                {customers?.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
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
              <InputLabel>Chọn chi nhánh</InputLabel>
              <Select {...field}>
                {branches?.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Ngày dự kiến xuất hàng"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    error={!!errors.plannedExportDate}
                    helperText={errors.plannedExportDate?.message}
                  />
                )}
              />
            </LocalizationProvider>
          )}
        />
        <Controller
          name="totalPrice"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Tổng tiền"
              fullWidth
              margin="normal"
              error={!!errors.totalPrice}
              helperText={errors.totalPrice?.message}
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors.status}>
              <InputLabel>Chọn tình trạng đơn hàng</InputLabel>
              <Select {...field} value={field.value || ""}>
                {gdrStatus?.map((status) => (
                  <MenuItem key={status.key} value={status.key}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.status?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <br></br>
        <Button
          type="submit"
          variant="contained"
          className="p-4 mt-4 mb-4 "
          style={{ width: "150px" }}
          color="primary"
        >
          Lưu đơn hàng
        </Button>
      </form>

      {/* Chi tiết đơn hàng */}
      <SectionTitle>Chi tiết đơn hàng</SectionTitle>
      <Button
        startIcon={<AddCircleOutlineIcon />}
        variant="contained"
        className="p-4 mt-4 mb-4"
        color="primary"
        onClick={() => setOpenModal(true)}
        style={{ width: "150px" }}
      >
        Xem chi tiết
      </Button>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ p: 4, bgcolor: "white", borderRadius: "10px" }}>
          <IconButton
            sx={{ position: "absolute", right: 10, top: 10 }}
            onClick={() => setOpenModal(false)}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6">Chi tiết đơn hàng</Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetails?.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>{detail.id}</TableCell>
                    <TableCell>{detail.orderCode}</TableCell>
                    <TableCell>{detail.productName}</TableCell>
                    <TableCell>{detail.quantity}</TableCell>
                    <TableCell>
                      {detail.price?.toLocaleString() || "N/A"} VNĐ
                    </TableCell>
                    <TableCell>
                      {(detail.quantity * (detail.price || 0)).toLocaleString()}{" "}
                      VNĐ
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      <SectionTitle>Thêm chi tiết nhập kho</SectionTitle>
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
                  Đơn hàng
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
                    <FormControl fullWidth>
                      <InputLabel className="">Chọn đơn hàng</InputLabel>
                    </FormControl>
                  </TableCell>
                  <TableCell className="border border-gray-600 ">
                    <FormControl fullWidth>
                      <InputLabel className="">Số lượng</InputLabel>
                    </FormControl>
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
