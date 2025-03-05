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
  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(0); // Chỉ mục trang (0-based index)
  const [limit] = useState(10); // Số lượng hiển thị mỗi trang
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await supplierAPI.getAllPaginated(page, limit);
        console.log("API Response:", response.data);
  
        if (response.data && Array.isArray(response.data.data)) {
          setSuppliers(response.data.data); // Sử dụng `response.data.data` thay vì `response.data`
          setTotalPages(Math.ceil(response.data.data.length / limit));
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response.data);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };
  
    fetchSuppliers();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) return;

    try {
      await supplierAPI.delete(id);
      showSuccessToast("Nhà cung cấp đã được xóa thành công!");

      setSuppliers((prevSuppliers) =>
        prevSuppliers.filter((sup) => sup.id !== id)
      );
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
            {suppliers.map((sup, index) => (
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
                        (window.location.href = `http://localhost:3000/app/supplier/edit-supplier/${sup.id}`)
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
}

export default AllSupplier;
