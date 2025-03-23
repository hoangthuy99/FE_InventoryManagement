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
import { productAPI } from "../../api/api";
import { Box, Container, Input } from "@mui/material";
import ImportExcel from "../../components/ImportExcel";
import Invoice from "../../components/Invoice";

const AllProduct = () => {
  const [products, setProducts] = useState([]);
  const [sampleFile, setSampleFile] = useState("");
  const [page, setPage] = useState(0); // Backend sử dụng page = 0
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllPaginated(page, limit);
      console.log("API Response:", response.data); // Xem API trả về gì
      const data = response.data;

      if (data && Array.isArray(data)) {
        setProducts(data);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response.data);
        showErrorToast("Lỗi dữ liệu API!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await productAPI.delete(id);
      showSuccessToast("Sản phẩm đã được xóa thành công!");

      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      showErrorToast("Xóa sản phẩm thất bại!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSampleFile();
  }, [page]);

  const handleImportExcel = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const res = await productAPI.importExcel(formData);

      if (res.data?.code === 200) {
        showSuccessToast("Thêm mới sản phẩm thành công!");
        fetchProducts();
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const fetchSampleFile = async () => {
    try {
      const res = await productAPI.getSampleFile();

      if (res.data?.code === 200) {
        setSampleFile(res.data.data);
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };


  return (
    <>
      <PageTitle>Danh sách sản phẩm</PageTitle>
      <Box className="mb-4" display={"flex"} justifyContent={"end"}>
        <ImportExcel action={handleImportExcel} sampleFile={sampleFile} />
      </Box>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Mã Code</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Ngày cập nhật</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {products?.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell>{page * limit + index + 1}</TableCell>
                <TableCell>{product.code}</TableCell>
                <TableCell>
                  <Avatar
                    size="large"
                    src={`http://localhost:8089/${product.img}`}
                    alt={product.name}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.categories.name}</TableCell>
                <TableCell>{product.qty}</TableCell>
                <TableCell>
                  {new Date(product.createdDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {product.updateDate
                    ? new Date(product.updateDate).toLocaleDateString()
                    : "Chưa cập nhật"}
                </TableCell>
                <TableCell>
                  <Badge type={product.activeFlag === 1 ? "success" : "danger"}>
                    {product.activeFlag === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Edit"
                      onClick={() =>
                        (window.location.href = `http://localhost:3000/app/product/edit-product/${product.id}`)
                      }
                    >
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>

                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => handleDelete(product.id)}
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
};

export default AllProduct;
