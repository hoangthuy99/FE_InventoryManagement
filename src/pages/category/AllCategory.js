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
import { Box } from "@mui/material";
import ImportExcel from "../../components/ImportExcel";
import FilterBox from "../../components/FilterBox";
import data from "../../assets/data.json";

function Category() {
  const [categories, setCategories] = useState([]);
  const [sampleFile, setSampleFile] = useState("");
  const [totalElements, setTotalElements] = useState(1);
  const [searchModel, setSearchModel] = useState({
    searchKey: "",
    status: -1,
    sortBy: "id",
    sortType: "desc",
    pageNum: 0,
    pageSize: 5,
  });
  const { activeStatus } = data;

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.searchCategories(searchModel);
      const data = response.data.data;
      console.log("API Response:", data);

      // Kiểm tra nếu API trả về một mảng danh mục
      if (Array.isArray(data.content)) {
        setCategories(data.content);
        setTotalElements(data.totalElements);
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

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

  const handleImportExcel = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      const res = await categoryAPI.importExcel(formData);

      if (res.data?.code === 200) {
        showSuccessToast("Thêm mới danh mục thành công!");
        fetchCategories();
        return true;
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const fetchSampleFile = async () => {
    try {
      const res = await categoryAPI.getSampleFile();

      if (res.data?.code === 200) {
        setSampleFile(res.data.data);
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  // Fetch danh mục có phân trang
  useEffect(() => {
    fetchSampleFile();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [searchModel.pageNum, searchModel.status]); // Khi `page` thay đổi, gọi API mới

  const handleChangeStatus = (status) => {
    console.log(status);

    setSearchModel({ ...searchModel, status });
  };

  const handleChangeSearchKey = (searchText) => {
    setSearchModel({ ...searchModel, searchKey: searchText });
  };

  const handlePaginate = (page) => {
    setSearchModel({ ...searchModel, pageNum: page - 1 });
  };

  return (
    <>
      <PageTitle>Danh sách danh mục</PageTitle>
      <FilterBox
        options={activeStatus.map((s) => {
          return { id: s.key, title: s.name };
        })}
        optionSelected={searchModel.status}
        handleChangeOption={handleChangeStatus}
        handleSearch={fetchCategories}
        handleChangeSearchKey={handleChangeSearchKey}
      />
      <Box className="flex flex-col justify-start mb-4 space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 sm:justify-end">
        <ImportExcel action={handleImportExcel} sampleFile={sampleFile} />
      </Box>
      <TableContainer className="mb-4 text-sm sm:mb-8 sm:text-base">
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
                <TableCell>{index + 1}</TableCell>
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
            totalResults={totalElements} // Tổng số kết quả
            resultsPerPage={searchModel.pageSize}
            onChange={handlePaginate}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default Category;
