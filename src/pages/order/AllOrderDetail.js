import { useEffect, useState } from "react";
import { orderDetailAPI } from "../../api/api";
import PageTitle from "../../components/Typography/PageTitle";
import SectionTitle from "../../components/Typography/SectionTitle";
import { Table, TableHeader, TableCell, TableBody, TableRow, TableContainer, TableFooter, Pagination, Badge } from "@windmill/react-ui";
import { showErrorToast } from "../../components/Toast";

function AllOrderDetail() {
  const [orderDetails, setOrderDetails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  useEffect(() => {
    fetchOrderDetails();
  }, [page]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderDetailAPI.getAllPaginated(page, resultsPerPage);
      setOrderDetails(response.data);
      setTotalResults(response.total);
    } catch (error) {
      showErrorToast("Lỗi khi tải dữ liệu chi tiết đơn hàng!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách chi tiết đơn hàng</PageTitle>
      <SectionTitle>Chi tiết các đơn hàng</SectionTitle>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>ID</TableCell>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {orderDetails.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell>{detail.id}</TableCell>
                <TableCell>{detail.orderCode}</TableCell>
                <TableCell>{detail.productName}</TableCell>
                <TableCell>{detail.quantity}</TableCell>
                <TableCell>{detail.price.toLocaleString()} VNĐ</TableCell>
                <TableCell>{(detail.quantity * detail.price).toLocaleString()} VNĐ</TableCell>
                <TableCell>
                  <Badge type={detail.status === "Đã giao" ? "success" : "warning"}>{detail.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            onChange={(p) => setPage(p)}
            label="Danh sách chi tiết đơn hàng"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default AllOrderDetail;
