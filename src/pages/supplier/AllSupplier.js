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
  Button,
  Pagination,
} from "@windmill/react-ui";
import { EditIcon, TrashIcon } from "../../icons";
import { supplierAPI } from "../../api/api";

function AllSupplier() {
  const [suppliers, setSuppliers] = useState([]); // Luôn là mảng
  const [page, setPage] = useState(0); // Trang hiện tại (bắt đầu từ 0)
  const [limit] = useState(10); // Số lượng hiển thị mỗi trang
  const [totalResults, setTotalResults] = useState(0); // Tổng số nhà cung cấp

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await supplierAPI.getAllPaginated(page, limit);
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.data)) {
          setSuppliers(response.data.data); // Chỉ lấy mảng `data`
          setTotalResults(response.data.total || response.data.data.length); // Tổng số bản ghi
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response.data);
          setSuppliers([]); // Tránh lỗi `map` nếu dữ liệu không hợp lệ
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        setSuppliers([]); // Đảm bảo không bị lỗi `map`
      }
    };

    fetchSuppliers();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;

    try {
      await supplierAPI.delete(id);
      showSuccessToast("Nhà cung cấp đã được xóa thành công!");

      // Cập nhật danh sách nhà cung cấp sau khi xóa
      setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
      setTotalResults((prev) => prev - 1);
    } catch (error) {
      showErrorToast("Xóa nhà cung cấp thất bại!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách nhà cung cấp</PageTitle>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Tên nhà cung cấp</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {suppliers.length > 0 ? (
              suppliers.map((sup, index) => (
                <TableRow key={sup.id}>
                  <TableCell>{page * limit + index + 1}</TableCell>
                  <TableCell>{sup.supCode}</TableCell>
                  <TableCell>{sup.name}</TableCell>
                  <TableCell>{sup.email}</TableCell>
                  <TableCell>{sup.address}</TableCell>
                  <TableCell>{sup.phone}</TableCell>
                  <TableCell>
                    <Badge type={sup.activeFlag === 1 ? "success" : "danger"}>
                      {sup.activeFlag === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Edit"
                        onClick={() =>
                          (window.location.href = `/app/supplier/edit-supplier/${sup.id}`)
                        }
                      >
                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>

                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => handleDelete(sup.id)}
                      >
                        <TrashIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="text-center">
                  Không có nhà cung cấp nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalResults}
            resultsPerPage={limit}
            onChange={(p) => setPage(p - 1)}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default AllSupplier;
