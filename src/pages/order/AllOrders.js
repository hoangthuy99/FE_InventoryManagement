import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Badge,
  Button,
  Pagination,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon } from "../../icons";
import PageTitle from "../../components/Typography/PageTitle";
import { orderAPI } from "../../api/api";

const orderStatusMap = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  READY_FOR_EXPORT: "Sẵn sàng xuất kho",
  EXPORTED: "Đã xuất kho",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const AllOrder = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getAllPaginated(page, resultsPerPage);
        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setOrders(response.data);
          setTotalPages(1); // Giả định chỉ có 1 trang
        } else if (response.data && response.data.orders) {
          // Trường hợp dữ liệu có đúng format
          setOrders(response.data.orders);
          setTotalPages(response.data.totalPages);
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response.data);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchOrders();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")) return;

    try {
      await orderAPI.delete(id);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
      alert("Đơn hàng đã được xóa thành công!");
    } catch (error) {
      alert("Xóa đơn hàng thất bại!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách đơn hàng</PageTitle>
      <TableContainer className="mt-4 mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Chi nhánh</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell >Địa chỉ giao hàng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày xuất hàng kế hoạch</TableCell>
              <TableCell>Ngày xuất hàng thực tế</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>{order.orderCode}</TableCell>
                <TableCell>{order.customer?.name || "N/A"}</TableCell>
                <TableCell>{order.branch?.name || "N/A"}</TableCell>
                <TableCell>{order.totalPrice?.toLocaleString()} VNĐ</TableCell>
                <TableCell  className="text-center break-words whitespace-normal">
  {order.deliveryAddress}
</TableCell>

                <TableCell>
                  <Badge
                    type={
                      order.status === "COMPLETED"
                        ? "success"
                        : order.status === "CANCELLED"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {orderStatusMap[order.status] || "Không xác định"}
                  </Badge>
                </TableCell>
                <TableCell>{order.plannedExportDate}</TableCell>
                <TableCell>{order.actualExportDate}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button layout="link" size="icon" aria-label="Edit">
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
            totalResults={totalPages * resultsPerPage}
            resultsPerPage={resultsPerPage}
            onChange={(p) => setPage(p)}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
};

export default AllOrder;
