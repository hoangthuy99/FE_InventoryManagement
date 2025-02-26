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
import { categoryAPI } from "../../api/api";

function Category() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0); // Backend sử dụng page = 0 (zero-based index)
  const [limit] = useState(10); // Số danh mục mỗi trang
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  // Fetch danh mục có phân trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllPaginated(page, limit);
        console.log("API Response:", response.data);

        // Kiểm tra nếu API trả về một mảng danh mục
        if (Array.isArray(response.data?.content)) {
          setCategories(response.data?.content);

          // Nếu API không trả về totalPages, tính toán từ số lượng dữ liệu
          setTotalPages(Math.ceil(response.data.length / limit));
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response.data);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchCategories();
  }, [page]); // Khi `page` thay đổi, gọi API mới

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      await categoryAPI.delete(id);
      showSuccessToast("Danh mục đã được xóa thành công!");

      // Cập nhật danh sách danh mục sau khi xóa
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== id)
      );
    } catch (error) {
      showErrorToast("Xóa danh mục thất bại!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách danh mục</PageTitle>

      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Mã Code</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell>{page * limit + index + 1}</TableCell>
                <TableCell>{category.code}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  {category.createdDate
                    ? new Date(category.createdDate).toLocaleDateString()
                    : "Không có dữ liệu"}
                </TableCell>
                <TableCell>
                  {category.updateDate
                    ? new Date(category.updateDate).toLocaleDateString()
                    : "Chưa cập nhật"}
                </TableCell>
                <TableCell>
                  <Badge
                    type={category.activeFlag === 1 ? "success" : "danger"}
                  >
                    {category.activeFlag === 1
                      ? "Hoạt động"
                      : "Ngừng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Edit"
                      onClick={() =>
                        (window.location.href = `http://localhost:3000/app/category/edit-category/${category.id}`)
                      }
                    >
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>

                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => handleDelete(category.id)}
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

export default Category;