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
import { customerAPI } from "../../api/api";
import { Box } from "@mui/material";
import ImportExcel from "../../components/ImportExcel";

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [sampleFile, setSampleFile] = useState("");
  const [page, setPage] = useState(0); // Backend sử dụng page = 0 (zero-based index)
  const [limit] = useState(10); // Số khách hàng mỗi trang
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAllPaginated(page, limit);
      console.log("API Response:", response.data);

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
        setTotalPages(Math.ceil(response.data.length / limit));
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;

    try {
      await customerAPI.delete(id);
      showSuccessToast("Khách hàng đã được xóa thành công!");

      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== id)
      );
    } catch (error) {
      showErrorToast("Xóa khách hàng thất bại!");
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const res = await customerAPI.importExcel(formData);

      if (res.data?.code === 200) {
        showSuccessToast("Thêm mới sản phẩm thành công!");
        fetchCustomers();
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const fetchSampleFile = async () => {
    try {
      const res = await customerAPI.getSampleFile();

      if (res.data?.code === 200) {
        setSampleFile(res.data.data);
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  // Fetch danh sách khách hàng có phân trang
  useEffect(() => {
    fetchCustomers();
    fetchSampleFile();
  }, [page]);

  return (
    <>
      <PageTitle>Danh sách khách hàng</PageTitle>
      <Box className="mb-4" display={"flex"} justifyContent={"end"}>
        <ImportExcel action={handleImportExcel} sampleFile={sampleFile} />
      </Box>
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Tên khách hàng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={customer.id}>
                <TableCell>{page * limit + index + 1}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.phone}</TableCell>

                <TableCell>
                  <Badge
                    type={customer.activeFlag === 1 ? "success" : "danger"}
                  >
                    {customer.activeFlag === 1
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
                        (window.location.href = `http://localhost:3000/app/customer/edit-customer/${customer.id}`)
                      }
                    >
                      <EditIcon className="w-5 h-5" aria-hidden="true" />
                    </Button>

                    <Button
                      layout="link"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => handleDelete(customer.id)}
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

export default Customer;
