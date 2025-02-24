import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableCell, TableBody, TableRow, TableFooter, TableContainer, Badge, Button, Pagination } from "@windmill/react-ui";
import { EditIcon, TrashIcon } from "../../icons";
import PageTitle from "../../components/Typography/PageTitle";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;
  const [totalResults, setTotalResults] = useState(0);

  // Giả định customerId, có thể lấy từ context hoặc props
  const customerId = 1;

  // Lấy danh sách đơn hàng theo customerId
  useEffect(() => {
    axios.get(`/app/order/all/${customerId}`)
      .then(response => {
        setOrders(response.data);
        setTotalResults(response.data.length);
      })
      .catch(error => console.error("Lỗi khi lấy danh sách đơn hàng:", error));
  }, [customerId]);

  // Xử lý phân trang
  const onPageChange = (p) => setPage(p);
  
  const paginatedOrders = orders.slice((page - 1) * resultsPerPage, page * resultsPerPage);

  return (
    <>
      <PageTitle>Danh sách đơn hàng</PageTitle>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>{order.orderCode}</TableCell>
                <TableCell>{order.customer?.name || "N/A"}</TableCell>
                <TableCell>${order.totalPrice}</TableCell>
                <TableCell>
                  <Badge type={order.status}>{order.status}</Badge>
                </TableCell>
                <TableCell>{new Date(order.createdDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button layout="link" size="icon" aria-label="Edit">
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>
                    <Button layout="link" size="icon" aria-label="Delete">
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
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onChange={onPageChange}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
};

export default Orders;
