import React, { useState, useEffect } from "react";
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
import PageTitle from "../../components/Typography/PageTitle";
import { orderAPI } from "../../api/api";
import { Checkbox } from "@mui/material";
import Invoice from "../../components/Invoice";
import data from "../../assets/data.json";

const AllOrder = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalOrders, setTotalOrders] = useState(1);
  const [invoiceData, setInvoiceData] = useState();
  const { productUnit } = data;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getAllPaginated(page - 1, limit);
        console.log("Dữ liệu API trả về:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
          setTotalOrders(response.data.totalElements);
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        setOrders([]);
        setTotalOrders(0);
      }
    };

    fetchOrders();
  }, [page, limit]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng?")) return;

    try {
      await orderAPI.delete(id);
      showSuccessToast("Đơn hàng đã được xóa thành công!");

      setOrders((prevOrders) =>
        prevOrders.filter((orders) => orders.id !== id)
      );
    } catch (error) {
      showErrorToast("Xóa đơn hàng thất bại!");
    }
  };

  const handlSelectCheckbox = (value, isCheck) => {
    console.log(value);

    if (isCheck) {
      console.log(orders);

      const data = orders.find((o) => {
        return o.id === Number(value);
      });

      setInvoiceData({
        branchName: data.branch.name,
        title: "Hóa đơn xuất hàng",
        invoiceNumber: data.orderCode,
        date: new Date(Date.now()).toLocaleDateString("vi-VN"),
        customerName: data.customer.name,
        customerAddress: data.customer.address,
        items: data.orderDetails.map((o) => {
          return {
            name: o.productInfo.name,
            unit: productUnit.find((u) => u.key === o.productUnit)?.name,
            quantity: o.productInfo.qty,
            price: o.productInfo.price,
          };
        }),
        total: data.totalPrice,
      });
    }
  };

  return (
    <>
      <PageTitle>Danh sách đơn hàng</PageTitle>
      <Invoice type={"gdi"} invoiceData={invoiceData} />
      <TableContainer className="mt-4 mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell></TableCell>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Chi nhánh</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Địa chỉ giao hàng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày xuất hàng kế hoạch</TableCell>
              <TableCell>Ngày xuất hàng thực tế</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Checkbox
                    onChange={(e) =>
                      handlSelectCheckbox(e.target.value, e.target.checked)
                    }
                    value={order.id}
                  />
                </TableCell>
                <TableCell>{order.orderCode}</TableCell>
                <TableCell>{order.customer?.name || "N/A"}</TableCell>
                <TableCell>{order.branch?.name || "N/A"}</TableCell>
                <TableCell>
                  {order.totalPrice
                    ? order.totalPrice.toLocaleString() + " VNĐ"
                    : "0 VNĐ"}
                </TableCell>
                <TableCell className="text-center break-words whitespace-normal">
                  {order.deliveryAddress || "N/A"}
                </TableCell>
                <TableCell>{order.status || "N/A"}</TableCell>
                <TableCell>{order.plannedExportDate || "N/A"}</TableCell>
                <TableCell>{order.actualExportDate || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Edit"
                      onClick={() =>
                        (window.location.href = `http://localhost:3000/app/order/edit-order/${order.id}`)
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalOrders}
            resultsPerPage={limit}
            onChange={(p) => setPage(p)}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
};

export default AllOrder;
