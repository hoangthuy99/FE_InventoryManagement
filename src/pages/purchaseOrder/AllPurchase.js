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
  Badge,
  Avatar,
  Button,
  Pagination,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon } from "../../icons";
import { productAPI, purchaseOrderAPI } from "../../api/api";
import data from "../../assets/data.json";

const AllPurchase = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [page, setPage] = useState(0); // Backend sử dụng page = 0
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { gdrStatus } = data;

  const fetchAllPurchase = async () => {
    try {
      const response = await purchaseOrderAPI.search();
      console.log("API Response:", response.data); // Xem API trả về gì
      const data = response.data?.data;

      if (data && Array.isArray(data)) {
        setPurchaseOrders(data);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response.data);
        showErrorToast("Lỗi dữ liệu API!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  useEffect(() => {
    fetchAllPurchase();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn nhập kho này?")) return;

    try {
      const res = await purchaseOrderAPI.deleteById(id);
      if (res.data?.code === 200)
        showSuccessToast("Đơn nhập kho đã được xóa thành công!");

      fetchAllPurchase();
    } catch (error) {
      showErrorToast("Xóa đơn nhập kho thất bại!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách đơn nhập kho</PageTitle>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
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
                          (window.location.href = `http://localhost:3000/app/product/edit-product/${order.id}`)
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
            totalResults={totalPages * limit}
            resultsPerPage={limit}
            onChange={(p) => setPage(p - 1)}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
};

export default AllPurchase;
