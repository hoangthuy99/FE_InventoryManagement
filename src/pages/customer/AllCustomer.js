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
import FilterBox from "../../components/FilterBox";
import data from "../../assets/data.json";

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [sampleFile, setSampleFile] = useState("");
  const [totalResults, setTotalResults] = useState(0);
 const [searchModel, setSearchModel] = useState({
     searchKey: "",
     status: -1,
     sortBy: "id",
     sortType: "desc",
     pageNum: 0,
     pageSize: 5,
   });
  const { activeStatus } = data;

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.searchCustomer(searchModel);
      const data = response.data.data;
      console.log("API Response:", data);

      // Kiểm tra nếu API trả về một mảng danh mục
      if (Array.isArray(data.content)) {
        setCustomers(data.content);
        setTotalResults(data.totalElements);
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
      // Refresh the list after deletion
      fetchCustomers();
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
        showSuccessToast("Thêm mới khách hàng thành công!");
        fetchCustomers();
      } else {
        showErrorToast(res.data?.message || "Thêm khách hàng thất bại!");
      }
    } catch (error) {
      showErrorToast("Lỗi khi nhập file Excel!");
    }
  };

  const fetchSampleFile = async () => {
    try {
      const res = await customerAPI.getSampleFile();
      if (res.data?.code === 200) {
        setSampleFile(res.data.data);
      } else {
        showErrorToast(res.data?.message || "Không thể tải file mẫu!");
      }
    } catch (error) {
      showErrorToast("Lỗi khi tải file mẫu!");
    }
  };

  const handleChangeStatus = (status) => {
    setSearchModel((prev) => ({ ...prev, status, pageNum: 0 }));
  };

  const handleChangeSearchKey = (searchText) => {
    setSearchModel((prev) => ({ ...prev, searchKey: searchText, pageNum: 0 }));
  };

  const handlePaginate = (page) => {
    setSearchModel((prev) => ({ ...prev, pageNum: page - 1 }));
  };

  // Fetch customers when searchModel changes
  useEffect(() => {
    fetchCustomers();
  }, [searchModel]);

  // Fetch sample file on component mount
  useEffect(() => {
    fetchSampleFile();
  }, []);

  return (
    <>
      <PageTitle>Danh sách khách hàng</PageTitle>
      <FilterBox
        options={activeStatus.map((s) => ({
          id: s.key,
          title: s.name,
        }))}
        optionSelected={searchModel.status}
        handleChangeOption={handleChangeStatus}
        handleSearch={fetchCustomers}
        handleChangeSearchKey={handleChangeSearchKey}
      />
      <Box className="mb-4" display="flex" justifyContent="end">
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
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                <TableRow key={customer.id}>
                  <TableCell>{searchModel.pageNum * searchModel.pageSize + index + 1}</TableCell>
                  <TableCell>{customer.name || "N/A"}</TableCell>
                  <TableCell>{customer.email || "N/A"}</TableCell>
                  <TableCell>{customer.address || "N/A"}</TableCell>
                  <TableCell>{customer.phone || "N/A"}</TableCell>
                  <TableCell>
                    <Badge type={customer.activeFlag === 1 ? "success" : "danger"}>
                      {customer.activeFlag === 1 ? "Hoạt động" : "Ngừng hoạt động"}
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
                     totalResults={totalResults} // Tổng số kết quả
                     resultsPerPage={searchModel.pageSize}
                     onChange={handlePaginate}
                     label="Table navigation"
                   />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default Customer;