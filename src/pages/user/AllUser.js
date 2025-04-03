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
import { supplierAPI, userAPI } from "../../api/api";
import FilterBox from "../../components/FilterBox";
import data from "../../assets/data.json";

function AllUser() {
  const [users, setUsers] = useState([]); // Luôn là mảng
  const [searchModel, setSearchModel] = useState({
    searchKey: "",
    status: -1,
    sortBy: "id",
    sortType: "desc",
    pageNum: 0,
    pageSize: 5,
  });
  const { activeStatus } = data;

  // const searchUsers = async () => {
  //   try {
  //     const response = await userAPI.search(searchModel);
  //     console.log("API Response:", response.data); // Xem API trả về gì
  //     const data = response.data?.data;

  //     if (data.content && Array.isArray(data.content)) {
  //       setUsers(data.content);
  //     } else {
  //       console.error("Dữ liệu API không đúng định dạng:", response.data);
  //       showErrorToast("Lỗi dữ liệu API!");
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi gọi API:", error);
  //   }
  // };
  // try {
  //       const response = await menuAPI.getAll();
  
  //       if (response.data && Array.isArray(response.data)) {
  //         setMenus(response.data);
  //         setTotalElements(response.data.totalElements || 0);
  //       } else {
  //         showErrorToast("Lỗi dữ liệu API! Dữ liệu không hợp lệ.");
  //       }
  //     } catch (error) {
  //       console.error("❌ Lỗi khi gọi API:", error);
  //       showErrorToast("Không thể tải danh sách menu.");
  //     }
  
  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll(); // Sử dụng API đã có Token
      console.log("Response:", response.data);
      setUsers(response.data); // Cập nhật state users
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      showErrorToast("Không thể tải danh sách nhân viên");
    }
};

  useEffect(() => {
    // searchUsers();
    fetchUsers();
  }, [searchModel.status, searchModel.pageNum]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;

    try {
      await userAPI.delete(id);
      showSuccessToast("Nhân viên đã được xóa thành công!");

      // Cập nhật danh sách nhân viên sau khi xóa
      // searchUsers()
      fetchUsers();
    } catch (error) {
      showErrorToast("Xóa nhân viên thất bại!");
    }
  };

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
      <PageTitle>Danh sách nhân viên</PageTitle>
      <FilterBox
        options={activeStatus.map((s) => {
          return { id: s.key, title: s.name };
        })}
        optionSelected={searchModel.status}
        handleChangeOption={handleChangeStatus}
        // handleSearch={searchUsers}
        handleChangeSearchKey={handleChangeSearchKey}
      />
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Tên nhân viên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Quyền hạn</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.userCode}</TableCell>
                  <TableCell>{user.fullname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.roles?.map(role => role.roleName).join(", ") || "Chưa có quyền"}</TableCell>

                  <TableCell>
                    <Badge type={user.activeFlag === 1 ? "success" : "danger"}>
                      {user.activeFlag === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Edit"
                        onClick={() =>
                          (window.location.href = `/app/user/edit-user/${user.id}`)
                        }
                      >
                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>

                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => handleDelete(user.id)}
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
                  Không có nhân viên nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <Pagination
            totalResults={users.length}
            resultsPerPage={searchModel.pageSize}
            onChange={handlePaginate}
            label="Table navigation"
          />
        </TableFooter>
      </TableContainer>
    </>
  );
}

export default AllUser;
