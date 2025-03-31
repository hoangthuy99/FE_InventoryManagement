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
import { menuAPI } from "../../api/api";
import { Box } from "@mui/material";
import ImportExcel from "../../components/ImportExcel";
import FilterBox from "../../components/FilterBox";
import data from "../../assets/data.json";

function AllMenu() {
  const [menus, setMenus] = useState([]);
  const [sampleFile, setSampleFile] = useState("");
  const [totalElements, setTotalElements] = useState(1);
  const [searchModel, setSearchModel] = useState({
    searchKey: "",
    status: -1,
    sortBy: "id",
    sortType: "desc",
    pageNum: 0,
    pageSize: 10,
  });
  const { activeStatus } = data;

  const fetchMenus = async () => {
    try {
      const response = await menuAPI.search(searchModel);
      const data = response.data;

      if (Array.isArray(data.content)) {
        setMenus(data.content);
        setTotalElements(data.totalElements);
      } else {
        showErrorToast("Lỗi dữ liệu API! Dữ liệu không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      showErrorToast("Không thể tải danh sách menu.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa menu này?")) return;
    try {
      await menuAPI.delete(id);
      showSuccessToast("Menu đã được xóa thành công!");
      setMenus(menus.filter((menu) => menu.id !== id));
    } catch (error) {
      showErrorToast("Xóa menu thất bại!");
    }
  };

  // const handleImportExcel = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target);
  //   try {
  //     const res = await menuAPI.importExcel(formData);
  //     if (res.data?.code === 200) {
  //       showSuccessToast("Thêm mới menu thành công!");
  //       fetchMenus();
  //     } else {
  //       showErrorToast(res.data?.message);
  //     }
  //   } catch (error) {
  //     showErrorToast(error);
  //   }
  // };

  const fetchSampleFile = async () => {
    try {
      const res = await menuAPI.getSampleFile();
      if (res.data?.code === 200) {
        setSampleFile(res.data.data);
      } else {
        showErrorToast(res.data?.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    fetchSampleFile();
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [searchModel.pageNum, searchModel.status]);

  return (
    <>
      <PageTitle>Danh sách Menu</PageTitle>
      <FilterBox
        options={activeStatus.map((s) => ({ id: s.key, title: s.name }))}
        optionSelected={searchModel.status}
        handleChangeOption={(status) =>
          setSearchModel({ ...searchModel, status })
        }
        handleSearch={fetchMenus}
        handleChangeSearchKey={(searchText) =>
          setSearchModel({ ...searchModel, searchKey: searchText })
        }
      />
      <Box className="mb-4" display="flex" justifyContent="end">
        {/* <ImportExcel action={handleImportExcel} sampleFile={sampleFile} /> */}
      </Box>
      <TableContainer className="mb-8 overflow-hidden rounded-lg shadow-lg">
        <Table>
          <TableHeader>
            <tr className="text-gray-700 bg-gray-200">
              <TableCell>STT</TableCell>
              <TableCell>Mã Menu</TableCell>
              <TableCell>Tên Menu</TableCell>
              <TableCell>Đường dẫn</TableCell>
              <TableCell>Icon</TableCell>
              <TableCell>Menu Cha</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {menus.length > 0 ? (
              menus.map((menu, index) => (
                <TableRow key={menu.id} className="transition hover:bg-gray-100">
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{menu.code}</TableCell>
                  <TableCell>{menu.name}</TableCell>
                  <TableCell>{menu.path || "Không có đường dẫn"}</TableCell>
                  <TableCell>{menu.icon || "Không có icon"}</TableCell>
                  <TableCell>{menu.parentId ? menu.parentId : "Không có"}</TableCell>
                  <TableCell>
                    <Badge type={menu.activeFlag ? "success" : "danger"}>
                      {menu.activeFlag ? "Hoạt động" : "Ngừng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(menu.createdDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        layout="link"
                        size="icon"
                        onClick={() =>
                          (window.location.href = `/app/menu/edit-menu/${menu.id}`)
                        }
                      >
                        <EditIcon className="w-5 h-5 text-blue-500" />
                      </Button>
                      <Button
                        layout="link"
                        size="icon"
                        onClick={() => handleDelete(menu.id)}
                      >
                        <TrashIcon className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="py-4 text-center text-gray-500">
                  Không có menu nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={totalElements}
            resultsPerPage={searchModel.pageSize}
            onChange={(page) =>
              setSearchModel({ ...searchModel, pageNum: page - 1 })
            }
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default AllMenu;