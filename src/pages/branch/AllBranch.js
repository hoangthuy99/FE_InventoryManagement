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
import { branchAPI } from "../../api/api";

function AllBranch() {
  const [branches, setBranches] = useState([]);
  const [page, setPage] = useState(0); 
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1); 

  // Fetch danh sách chi nhánh có phân trang
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchAPI.getAllPaginated(page, limit);
        console.log("API Response:", response.data);

        // Kiểm tra nếu API trả về một mảng chi nhánh
        if (Array.isArray(response.data)) {
          setBranches(response.data);
          setTotalPages(response.data.totalPages || 1);
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response.data);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchBranches();
  }, [page]); // Khi `page` thay đổi, gọi API mới

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) return;

    try {
      await branchAPI.delete(id);
      showSuccessToast("Chi nhánh đã được xóa thành công!");

      // Cập nhật danh sách sau khi xóa
      setBranches((prevBranches) =>
        prevBranches.filter((branch) => branch.id !== id)
      );
    } catch (error) {
      showErrorToast("Xóa chi nhánh thất bại!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách chi nhánh</PageTitle>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Tên chi nhánh</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {branches.map((branch, index) => (
              <TableRow key={branch.id}>
                <TableCell>{page * limit + index + 1}</TableCell>
                <TableCell>{branch.name}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{branch.phone}</TableCell>
                <TableCell>
                  <Badge type={branch.activeFlag === 1 ? "success" : "danger"}>
                    {branch.activeFlag === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Edit"
                      onClick={() =>
                        (window.location.href = `http://localhost:3000/app/branch/edit-branch/${branch.id}`)
                      }
                    >
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>

                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => handleDelete(branch.id)}
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
            totalResults={totalPages * limit} // Tổng số kết quả
            resultsPerPage={limit}
            onChange={(p) => setPage(p - 1)}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default AllBranch;
