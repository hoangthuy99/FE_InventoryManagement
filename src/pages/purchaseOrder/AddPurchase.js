import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Input, Label, Textarea, Button, HelperText } from "@windmill/react-ui";
import {
  productAPI,
  categoryAPI,
  supplierAPI,
  branchAPI,
  purchaseOrderAPI,
} from "../../api/api";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import data from "../../assets/data.json";
import { useHistory } from "react-router-dom";

function AddPurchase() {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { gdrStatus, productUnit, stockStatus } = data;
  const history = useHistory();

  const fetchAllProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  const fetchAllSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(
        Array.isArray(response.data?.data) ? response.data?.data : []
      );
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  const fetchAllBranchs = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranchs(Array.isArray(response.data?.data) ? response.data?.data : []);
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchAllSuppliers();
    fetchAllBranchs();
  }, []);

  const handleChangeProduct = (index, field, value) => {
    const updateItems = [...orderItems];
    updateItems[index][field] = value;
    setOrderItems(updateItems);
  };

  const handleAddItem = (item) => {
    setOrderItems([...orderItems, item]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(
      (items) => items.filter((_, i) => i !== index) // Xóa phần tử theo index
    );
  };

  // validate form
  const purchaseSchema = yup.object().shape({
    orderDatePlan: yup.date(dayjs()).required("Ngày đặt hàng là bắt buộc"),
    orderDateActual: yup.date(dayjs()),
    supplierId: yup.number().required("Nhà cung cấp là bắt buộc"),
    branchId: yup.number().required("Chi nhánh là bắt buộc"),
    status: yup.number().required("Trạng thái là bắt buộc"),
    note: yup.string(),
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(purchaseSchema),
  });

  const submitForm = async (data) => {
    const items = orderItems.map((item) => {
      return {
        productId: item?.productId,
        areaId: item?.areaId,
        itemUnit: item?.productUnit,
        stockType: item?.stockType,
        quantityPlan: parseInt(item?.quantityPlan),
        quantityActual: parseInt(item?.quantityActual),
      };
    });

    const dataRequest = {
      supplierId: data?.supplierId,
      orderDatePlan: data?.orderDatePlan,
      orderDate: data?.orderDateActual,
      branchId: data?.branchId,
      status: data?.status,
      note: data?.note,
      items,
    };

    try {
      const res = purchaseOrderAPI.addNew(dataRequest);
      if (res.data?.code === 200) {
        history.push("/purchase/all-purchase")
        showSuccessToast("Create purchase order successfully");
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <>
      <SectionTitle>Thông tin nhập kho</SectionTitle>
      <form onSubmit={handleSubmit(submitForm)} className="p-4 text-white">
        <div className="px-4 py-3 mb-8  rounded-lg shadow-md dark:bg-gray-800">
          <Grid container spacing={2}>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-64">Nhà cung cấp </span>
              <Controller
                name="supplierId"
                control={control}
                render={(renderProps) => (
                  <FormControl fullWidth>
                    <InputLabel className="text-white ">
                      Chọn nhà cung cấp
                    </InputLabel>
                    <Select
                      error={renderProps.fieldState.error}
                      value={renderProps.field.value}
                      onChange={renderProps.field.onChange}
                      label="Chọn nhà cung cấp"
                      className="text-white border border-gray-600"
                    >
                      <MenuItem value="">-- Chọn nhà cung cấp --</MenuItem>
                      {suppliers?.map((supplier) => (
                        <MenuItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
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
              <HelperText valid={false}></HelperText>
            </Grid>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-64">Chi nhánh </span>
              <Controller
                name="branchId"
                control={control}
                render={(renderProps) => (
                  <FormControl fullWidth>
                    <InputLabel className="text-white">
                      Chọn chi nhánh
                    </InputLabel>
                    <Select
                      error={renderProps.fieldState.error}
                      value={renderProps.field.value}
                      onChange={renderProps.field.onChange}
                      label="Nhà cung cấp"
                      className="text-white border border-gray-600"
                    >
                      {branchs.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name}
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
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-64">Ngày nhập kho kế hoạch </span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={getValues("orderDatePlan")}
                  onChange={(newValue) =>
                    setValue("orderDatePlan", newValue, {
                      shouldValidate: true,
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      error={errors.orderDatePlan}
                      {...register("orderDatePlan")}
                      {...params}
                      fullWidth
                    />
                  )}
                />
                {errors.orderDatePlan && (
                  <FormHelperText className="text-red-600">
                    {errors.orderDatePlan.message}
                  </FormHelperText>
                )}
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-64">Ngày nhập kho </span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={getValues("orderDateActual")}
                  onChange={(newValue) => setValue("orderDateActual", newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...register("orderDateActual")}
                      fullWidth
                      sx={{ color: "#fff" }}
                    />
                  )}
                />
              </LocalizationProvider>
              <HelperText valid={false}></HelperText>
            </Grid>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-64">Trạng thái </span>
              <Controller
                name="status"
                control={control}
                render={(renderProps) => (
                  <FormControl fullWidth>
                    <InputLabel className="text-white">
                      Chọn trạng thái
                    </InputLabel>
                    <Select
                      error={renderProps.fieldState.error}
                      value={renderProps.field.value}
                      onChange={renderProps.field.onChange}
                      label="Chọn trạng thái"
                      className="text-white border border-gray-600"
                    >
                      {gdrStatus.map((status) => (
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
              <HelperText valid={false}></HelperText>
            </Grid>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-64">Ghi chú </span>
              <Textarea {...register("note")} minRows={1} />
              <HelperText valid={false}></HelperText>
            </Grid>
          </Grid>
        </div>
        <SectionTitle>Chi tiết nhập kho</SectionTitle>
        <div className="px-4 py-3 mb-8 rounded-lg shadow-md dark:bg-gray-800">
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      color=""
                      onClick={() => {
                        handleAddItem({
                          productId: 0,
                          quantity: 0,
                        });
                      }}
                    >
                      <AddCircleOutlineIcon />
                    </Button>
                  </TableCell>
                  <TableCell className="text-white" width="15%">
                    Sản phẩm
                  </TableCell>
                  <TableCell className="text-white" width="15%">
                    Đơn vị
                  </TableCell>
                  <TableCell className="text-white" width="15%">
                    Loại tồn kho
                  </TableCell>
                  <TableCell className="text-white">
                    Số lượng kế hoạch
                  </TableCell>
                  <TableCell className="text-white">Số lượng</TableCell>
                  <TableCell className="text-white" width="15%">
                    Khu vực kế hoạch
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <RemoveCircleOutlineIcon />
                      </Button>
                    </TableCell>
                    <TableCell className="text-white">
                      <FormControl fullWidth>
                        <InputLabel className="text-white">
                          Chọn product
                        </InputLabel>
                        <Select
                          value={item.productId}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "productId",
                              e.target.value
                            )
                          }
                          label="Chọn product"
                          className="text-white border border-gray-600"
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel className="text-white">
                          Chọn đơn vị
                        </InputLabel>
                        <Select
                          value={item.productUnit}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "productUnit",
                              e.target.value
                            )
                          }
                          label="Chọn đơn vị"
                          className="text-white border border-gray-600"
                        >
                          {productUnit.map((unit) => (
                            <MenuItem key={unit.key} value={unit.key}>
                              {unit.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel className="text-white">
                          Chọn loại tồn kho
                        </InputLabel>
                        <Select
                          value={item.stockType}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "stockType",
                              e.target.value
                            )
                          }
                          label="Chọn loại tồn kho"
                          className="text-white border border-gray-600"
                        >
                          {stockStatus.map((status) => (
                            <MenuItem key={status.key} value={status.key}>
                              {status.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        defaultValue={0}
                        className="text-white border border-gray-600"
                        value={item.quantityPlan}
                        onChange={(e) =>
                          handleChangeProduct(
                            index,
                            "quantityPlan",
                            e.target.value
                          )
                        }
                        fullWidth
                        inputProps={{
                          className: "text-white border border-gray-600",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        defaultValue={0}
                        value={item.quantityActual}
                        onChange={(e) =>
                          handleChangeProduct(
                            index,
                            "quantityActual",
                            e.target.value
                          )
                        }
                        fullWidth
                        inputProps={{
                          className: "text-white border border-gray-600",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel className="text-white">
                          Chọn khu vực
                        </InputLabel>
                        <Select
                          value={item.areaId}
                          onChange={(e) =>
                            handleChangeProduct(index, "areaId", e.target.value)
                          }
                          label="Chọn khu vực"
                          className="text-white border border-gray-600"
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <Button type="submit" disabled={loading} className="mt-4 w-1/6">
          {loading ? "Đang xử lý..." : "Thêm sản phẩm"}
        </Button>
      </form>
    </>
  );
}

export default AddPurchase;
