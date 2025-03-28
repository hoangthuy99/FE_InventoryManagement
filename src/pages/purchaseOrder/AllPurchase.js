import React, { useState, useEffect } from "react";
import PageTitle from "../../components/Typography/PageTitle";
import { showSuccessToast, showErrorToast } from "../../components/Toast";

import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Button,
  Pagination,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon } from "../../icons";
import { purchaseOrderAPI } from "../../api/api";
import data from "../../assets/data.json";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import FilterBox from "../../components/FilterBox";
import Invoice from "../../components/Invoice";
import { Box, Checkbox } from "@mui/material";

const AllPurchase = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(1);
  const [searchModel, setSearchModel] = useState({
    searchKey: "",
    status: -1,
    sortBy: "id",
    sortType: "desc",
    pageNum: 0,
    pageSize: 5,
  });
  const { gdrStatus, productUnit } = data;
  const history = useHistory();
  const [invoiceData, setInvoiceData] = useState();

  const searchPurchase = async () => {
    try {
      const response = await purchaseOrderAPI.search(searchModel);
      console.log("API Response:", response.data); // Xem API trả về gì
      const data = response.data?.data;

      if (data.content && Array.isArray(data.content)) {
        setPurchaseOrders(data.content);
        setTotalElements(data.totalElements);
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response.data);
        showErrorToast("Lỗi dữ liệu API!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  useEffect(() => {
    searchPurchase();
  }, [searchModel.status, searchModel.pageNum]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn nhập kho này?")) return;

    try {
      const res = await purchaseOrderAPI.deleteById(id);
      if (res.data?.code === 200)
        showSuccessToast("Đơn nhập kho đã được xóa thành công!");

      searchPurchase();
    } catch (error) {
      showErrorToast("Xóa đơn nhập kho thất bại!");
    }
  };

  const handleChangeStatus = (status) => {
    console.log(status);

    setSearchModel({ ...searchModel, status });
  };

  const handleChangeSearchKey = (searchText) => {
    setSearchModel({ ...searchModel, searchKey: searchText });
  };

  const handlePaginate = (page) => {
    setSearchModel({ ...searchModel, pageNum: page - 1 });
  };

  const handlSelectCheckbox = (value, isCheck) => {
    console.log(value);

    if (isCheck) {
      console.log(purchaseOrders);

      const data = purchaseOrders.find((o) => {
        return o.id === Number(value);
      });

      setInvoiceData({
        branchName: data.branch.name,
        title: "Hóa đơn nhập hàng",
        invoiceNumber: data.code,
        date: new Date(Date.now()).toLocaleDateString("vi-VN"),
        supplierName: data.supplier.name,
        supplierAddress: data.supplier.address,
        items: data.purchaseOrderItems.map((o) => {
          return {
            name: o.product.name,
            unit: productUnit.find((u) => u.key === o.itemUnit).name,
            quantity: o.product.qty,
            price: o.product.price,
          };
        }),
        total: data.totalAmount,
      });
    }
  };

  return (
    <>
      <PageTitle>Danh sách đơn nhập kho</PageTitle>
      <Box
        marginBottom={3}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <FilterBox
          options={gdrStatus.map((s) => {
            return { id: s.key, title: s.name };
          })}
          optionSelected={searchModel.status}
          handleChangeOption={handleChangeStatus}
          handleSearch={searchPurchase}
          handleChangeSearchKey={handleChangeSearchKey}
        />
        <Invoice type={"gdr"} invoiceData={invoiceData} />
      </Box>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell></TableCell>
              <TableCell>STT</TableCell>
              <TableCell>Mã Code</TableCell>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Chi nhánh</TableCell>
              <TableCell>Ngày nhập kho kế hoạch</TableCell>
              <TableCell>Ngày nhập kho thực tế</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {purchaseOrders?.map((order, index) => (
              <TableRow key={order?.id}>
                <TableCell>
                  <Checkbox
                    onChange={(e) =>
                      handlSelectCheckbox(e.target.value, e.target.checked)
                    }
                    value={order.id}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{order?.code}</TableCell>
                <TableCell>{order?.supplier.name}</TableCell>
                <TableCell>{order?.branch.name}</TableCell>
                <TableCell>{order?.orderDatePlan}</TableCell>
                <TableCell>{order?.orderDate}</TableCell>
                <TableCell>{order?.createdAt}</TableCell>
                <TableCell>{order?.updatedAt}</TableCell>
                <TableCell>
                  {gdrStatus?.find((s) => s.key === order?.status)?.name}
                </TableCell>
                <TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Edit"
                        onClick={() =>
                          history.push(`/app/purchase/add-purchase/${order.id}`)
                        }
                      >
                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>

                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => handleDelete(order.id)}
                      >
                        <TrashIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalElements}
            resultsPerPage={searchModel.pageSize || 0}
            onChange={handlePaginate}
            label="Page navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
};

export default AllPurchase;
