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
import { useHistory } from "react-router-dom";
import * as yup from "yup";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid";
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
import { useParams } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

function AddOrder() {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const { orStatus, productUnit } = data;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const history = useHistory();

  const { id } = useParams();
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
    getValue,
    reset,
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
  const handleInputChange = async (e) => {
    const address = e.target.value;
    setValue("deliveryAddress", address);

    if (address.length > 3) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
        );
        const data = await res.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          setLocation([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm địa chỉ:", error);
      }
    }
  };

  const fetchAllData = async () => {
    try {
      const [customerRes, branchRes, productRes] = await Promise.all([
        customerAPI.getAll(),
        branchAPI.getAll(),
        productAPI.getAll(),
      ]);

      setCustomers(customerRes.data || []);
      setBranches(branchRes.data || []);
      setProducts(productRes.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  const fetchOrderById = async () => {
    try {
      const response = await orderAPI.getById(id);
      if (!response?.data) {
        console.error("API không trả về dữ liệu hợp lệ");
        return;
      }

      const data = response.data;

      if (data) {
        reset({
          customerId: data.customer?.id || "",
          branchId: data.branch?.id || "",
          plannedExportDate: dayjs(data.plannedExportDate) || dayjs(),
          actualExportDate: dayjs(data.actualExportDate) || dayjs(),
          deliveryAddress: data.deliveryAddress || "",
          status: data.status || "",
          note: data.note || "",
          totalPrice: data.totalPrice || "",
        });

        const items = data.orderDetails.map((item) => ({
          id: item?.id || "",
          productId: item?.productInfo?.id || "",
          unitPrice: item?.unitPrice || 0,
          productUnit: item?.productUnit || "",
          qty: item?.qty || 0,
          totalPrice: (item?.unitPrice || 0) * (item?.qty || 0),
          deleteFg: item?.deleteFg,
        }));

        setOrderDetails(items);
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchOrderById();
  }, []);

  const calculateTotalPrice = (items) => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const handleChangeProduct = (index, field, value) => {
    setOrderDetails((prevDetails) => {
      const updatedItems = [...prevDetails];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === "productId") {
        const selectedProduct = products.find((p) => p.id === value);
        if (selectedProduct) {
          updatedItems[index].unitPrice = selectedProduct.price || 0;
        }
      }

      if (field === "qty" || field === "productId") {
        updatedItems[index].totalPrice =
          (updatedItems[index].unitPrice || 0) * (updatedItems[index].qty || 0);
      }

      setValue("totalPrice", calculateTotalPrice(updatedItems));
      return updatedItems;
    });
  };

  const handleAddItem = () => {
    setOrderDetails([
      ...orderDetails,
      { productId: "", unitPrice: 0, qty: 1, totalPrice: 0 , deleteFg: false},
    ]);
  };

  //remove if don't have id set deleteFg is true if have id
  const handleRemoveItem = (index) => {
    setOrderDetails((items) => {
      const updatedItems = [...items];
      if (updatedItems[index].id) {
        updatedItems[index].deleteFg = true;
      } else {
        updatedItems.splice(index, 1);
      }
      setValue("totalPrice", calculateTotalPrice(updatedItems));
      return updatedItems;
    });

    console.log(orderDetails);
  };

  const submitForm = async (data) => {
    try {
      const totalPrice = calculateTotalPrice(orderDetails);
      const dataRequest = {
        id: id || "",
        customerId: data.customerId,
        branchId: data.branchId,
        plannedExportDate: data.plannedExportDate,
        actualExportDate: data.actualExportDate,
        deliveryAddress: data.deliveryAddress,
        totalPrice,
        status: data.status,
        note: data.note,
        orderDetailsRequest: orderDetails.map((item) => ({
          id: item.id,
          productId: item.productId,
          qty: item.qty,
          productUnit: item.productUnit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          deleteFg: item.deleteFg,
        })),
      };

      let res = id
        ? await orderAPI.updateOrder(dataRequest)
        : await orderAPI.saveOrder(dataRequest);

      if (res.data?.code === 200) {
        history.push("/app/order/all-orders");
        alert(`${id ? "Cập nhật" : "Tạo"} đơn hàng thành công`);
      } else {
        alert("Lỗi khi cập nhật đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi API:", error);
      alert("Lỗi khi cập nhật đơn hàng");
    }
  };

  return (
    <>
      <SectionTitle>Thêm Đơn Hàng</SectionTitle>
      <form onSubmit={handleSubmit(submitForm)}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.customerId}
                >
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
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="branchId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.branchId}
                >
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
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={6}>
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
          </Grid>
          <Grid item xs={6}>
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
          </Grid>
        </Grid>

        {id && (
          <Grid item xs={6} className="flex items-center gap-10">
            <Controller
              name="status"
              control={control}
              render={(renderProps) => (
                <FormControl fullWidth>
                  <InputLabel>Chọn trạng thái</InputLabel>
                  <Select
                    error={renderProps.fieldState.error}
                    value={renderProps.field.value || ""}
                    onChange={renderProps.field.onChange}
                    label="Chọn trạng thái"
                    className="text-gray-600 border border-gray-600 dark:text-gray-300text-gray-600 dark:text-gray-300"
                  >
                    {orStatus.map((status) => (
                      <MenuItem key={status.key} value={status.key}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {renderProps.fieldState.error && (
                    <FormHelperText className="text-red-600">
                      {renderProps.fieldState.error.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
        )}

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
            <FormControl error={!!errors.totalPrice}>
              <TextField
                value={field.value ? `${field.value.toLocaleString()} VNĐ` : ""}
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
                {orderDetails?.map((item, index) => {
                  if (item.deleteFg === false || item.deleteFg === null) {
                    return (
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
                    );
                  }
                })}
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

export default AddOrder;
