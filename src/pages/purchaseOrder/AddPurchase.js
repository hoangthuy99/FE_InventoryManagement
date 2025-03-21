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
  areaAPI,
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
import { useParams } from "react-router-dom/cjs/react-router-dom";

function AddPurchase() {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branchs, setBranchs] = useState([]);
  const [areas, setAreas] = useState([]);
  const [order, setOrder] = useState();
  const [loading, setLoading] = useState(false);
  const { gdrStatus, productUnit, stockStatus } = data;
  const history = useHistory();
  const { id } = useParams();

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
      setBranchs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  const fetchOrderById = async () => {
    try {
      const response = await purchaseOrderAPI.getById(id);
      const data = response.data?.data;

      if (data) {
        reset({
          supplierId: data?.supplier.id || "",
          branchId: data?.branch.id || "",
          orderDateActual: dayjs(data?.orderDate) || dayjs(),
          orderDatePlan: dayjs(data?.orderDatePlan) || dayjs(),
          status: data?.status || "",
          note: data?.note || "",
        });

        // set order items
        const items = data?.purchaseOrderItems.map((item) => {
          return {
            id: item?.id || "",
            productId: item?.product.id || "",
            itemUnit: item?.itemUnit || "",
            stockType: item?.stockType || "",
            quantityPlan: item?.quantityPlan || 0,
            quantityActual: item?.quantityActual || 0,
            areaId: item?.area ? item?.area.id : "",
          };
        });

        setOrderItems(items);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  const fetchAllAreas = async () => {
    try {
      const response = await areaAPI.getAll();
      setAreas(Array.isArray(response.data?.data) ? response.data?.data : []);
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchAllSuppliers();
    fetchAllBranchs();
    fetchAllAreas();
    if(id){
      fetchOrderById();
    }
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
    status: yup.number(),
    note: yup.string(),
  });

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(purchaseSchema),
  });

  const submitForm = async (data) => {
    if (!window.confirm("Bạn có chắc chắn muốn lưu đơn nhập kho này?")) return;

    const dataRequest = {
      id: id || "",
      supplierId: data?.supplierId,
      orderDatePlan: data?.orderDatePlan,
      orderDate: data?.orderDateActual,
      branchId: data?.branchId,
      status: data?.status,
      note: data?.note,
      items: orderItems,
    };

    try {
      let res;
      console.log(dataRequest);

      if (id) {
        res = await purchaseOrderAPI.update(dataRequest);
      } else {
        res = await purchaseOrderAPI.addNew(dataRequest);
      }

      if (res.data?.code === 200) {
        history.push("/app/purchase/all-purchase");
        showSuccessToast(
          `${id ? "Update" : "Create"} purchase order successfully`
        );
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <>
      <SectionTitle>Thông tin nhập kho</SectionTitle>
      <form onSubmit={handleSubmit(submitForm)} className="p-4">
        <div className="px-4 py-3 mb-8  rounded-lg shadow-md dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          <Grid container spacing={2}>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-1/2 ">Nhà cung cấp </span>
              <Controller
                name="supplierId"
                control={control}
                render={(renderProps) => (
                  <FormControl fullWidth>
                    <InputLabel className="text-gray-600 dark:text-gray-300">
                      Chọn nhà cung cấp
                    </InputLabel>
                    <Select
                      error={renderProps.fieldState.error}
                      value={renderProps.field.value || ""}
                      onChange={renderProps.field.onChange}
                      label="Chọn nhà cung cấp"
                      className=" border border-gray-600 text-gray-600 dark:text-gray-300text-gray-600 dark:text-gray-300"
                    >
                      <MenuItem selected value="">
                        -- Chọn nhà cung cấp --
                      </MenuItem>
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
            </Grid>
            <Grid item xs={6} className="flex items-center gap-10">
              <span className="w-1/2">Chi nhánh </span>
              <Controller
                name="branchId"
                control={control}
                render={(renderProps) => (
                  <FormControl fullWidth>
                    <InputLabel className="text-gray-600 dark:text-gray-300">
                      Chọn chi nhánh
                    </InputLabel>
                    <Select
                      error={renderProps.fieldState.error}
                      value={renderProps.field.value || ""}
                      onChange={renderProps.field.onChange}
                      label="Nhà cung cấp"
                      className="text-gray-600 dark:text-gray-300 border border-gray-600"
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
              <span className="w-1/2">Ngày nhập kho kế hoạch </span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  minDateTime={dayjs()}
                  value={getValues("orderDatePlan") || dayjs()}
                  onChange={(newValue) =>
                    setValue("orderDatePlan", newValue, {
                      shouldValidate: true,
                    })
                  }
                  sx={{ width: "100% " }}
                  className="border border-gray-600"
                  renderInput={(params) => (
                    <TextField
                      error={errors.orderDatePlan}
                      {...register("orderDatePlan")}
                      {...params}
                      className="border border-gray-600"
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
              <span className="w-1/2">Ngày nhập kho </span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  minDateTime={dayjs()}
                  value={getValues("orderDateActual") || dayjs()}
                  onChange={(newValue) => setValue("orderDateActual", newValue)}
                  sx={{ width: "100% " }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      {...register("orderDateActual")}
                      fullWidth
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            {id && (
              <Grid item xs={6} className="flex items-center gap-10">
                <span className="w-1/2">Trạng thái </span>
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
                        className=" border border-gray-600 text-gray-600 dark:text-gray-300text-gray-600 dark:text-gray-300"
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
              </Grid>
            )}
            <Grid item xs={6} className="flex items-center gap-10 ">
              <span className="w-1/2">Ghi chú </span>
              <Textarea
                className="border border-gray-600"
                {...register("note")}
                minRows={1}
              />
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
                          productId: "",
                          quantity: 0,
                        });
                      }}
                    >
                      <AddCircleOutlineIcon />
                    </Button>
                  </TableCell>
                  <TableCell
                    className=" text-gray-600 dark:text-gray-300"
                    width="15%"
                  >
                    Sản phẩm
                  </TableCell>
                  <TableCell
                    className=" text-gray-600 dark:text-gray-300"
                    width="15%"
                  >
                    Đơn vị
                  </TableCell>
                  <TableCell
                    className=" text-gray-600 dark:text-gray-300"
                    width="15%"
                  >
                    Loại tồn kho
                  </TableCell>
                  <TableCell className=" text-gray-600 dark:text-gray-300">
                    Số lượng kế hoạch
                  </TableCell>
                  <TableCell className=" text-gray-600 dark:text-gray-300">
                    Số lượng
                  </TableCell>
                  <TableCell
                    className=" text-gray-600 dark:text-gray-300"
                    width="15%"
                  >
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
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel className=" text-gray-600 dark:text-gray-300">
                          Chọn product
                        </InputLabel>
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
                          className="text-gray-600 dark:text-gray-300 border border-gray-600"
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
                        <InputLabel className="text-gray-600 dark:text-gray-300">
                          Chọn đơn vị
                        </InputLabel>
                        <Select
                          value={item.itemUnit || ""}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "itemUnit",
                              e.target.value
                            )
                          }
                          label="Chọn đơn vị"
                          className="text-gray-600 dark:text-gray-300 border border-gray-600"
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
                        <InputLabel className="text-gray-600 dark:text-gray-300">
                          Chọn loại tồn kho
                        </InputLabel>
                        <Select
                          value={item.stockType || ""}
                          onChange={(e) =>
                            handleChangeProduct(
                              index,
                              "stockType",
                              e.target.value
                            )
                          }
                          label="Chọn loại tồn kho"
                          className="text-gray-600 dark:text-gray-300 border border-gray-600"
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
                        className="text-gray-600 dark:text-gray-300 border border-gray-600"
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
                          className:
                            "text-gray-600 dark:text-gray-300 border border-gray-600",
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
                          className:
                            "text-gray-600 dark:text-gray-300 border border-gray-600",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel className="text-gray-600 dark:text-gray-300">
                          Chọn khu vực
                        </InputLabel>
                        <Select
                          value={item.areaId || ""}
                          onChange={(e) =>
                            handleChangeProduct(index, "areaId", e.target.value)
                          }
                          label="Chọn khu vực"
                          className="text-gray-600 dark:text-gray-300 border border-gray-600"
                        >
                          {areas?.map((area) => (
                            <MenuItem key={area.id} value={area.id}>
                              {area.name}
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
          {loading ? "Đang xử lý..." : id ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </form>
    </>
  );
}

export default AddPurchase;
