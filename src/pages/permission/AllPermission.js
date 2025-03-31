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
import { userAPI,permissionAPI } from "../../api/api";
import FilterBox from "../../components/FilterBox";
import data from "../../assets/data.json";

function AllPermission() {
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchModel, setSearchModel] = useState({
    searchKey: "",
    status: -1,
    sortBy: "id",
    sortType: "desc",
    pageNum: 0,
    pageSize: 5,
  });
  const { activeStatus } = data;

  const fetchPermissions = async () => {
    try {
      const response = await permissionAPI.getAll();
      console.log("Dữ liệu API trả về:", response.data);

      if (!response.data || !Array.isArray(response.data)) {
        showErrorToast("Lỗi dữ liệu API! Không có dữ liệu phù hợp.");
        return;
      }

      setPermissions(response.data); // BỔ SUNG: Gán dữ liệu API vào state
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error(" Lỗi khi gọi API:", error);
      showErrorToast("Không thể tải danh sách quyền.");
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll(); // Gọi API lấy danh sách user
      const userMap = {};
      response.data.forEach(user => {
        userMap[user.id] = user.name; // Map userId -> userName
      });
      setUsers(userMap);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách user:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchUsers ();
  }, [searchModel.status, searchModel.pageNum]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa quyền này?")) return;
    try {
      await permissionAPI.delete(id);
      showSuccessToast("Quyền đã được xóa thành công!");
      fetchPermissions();
    } catch (error) {
      showErrorToast("Xóa quyền thất bại!");
    }
  };

  return (
    <>
      <PageTitle>Danh sách quyền</PageTitle>
      <FilterBox
        options={activeStatus.map((s) => ({ id: s.key, title: s.name }))}
        optionSelected={searchModel.status}
        handleChangeOption={(status) =>
          setSearchModel({ ...searchModel, status })
        }
        handleSearch={fetchPermissions}
        handleChangeSearchKey={(searchText) =>
          setSearchModel({ ...searchModel, searchKey: searchText })
        }
      />
      <TableContainer className="mb-8">
        <Table>
          <TableHeader>
            <tr>
              <TableCell>STT</TableCell>
              <TableCell>Tên quyền</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Chức năng cụ thể</TableCell>
              <TableCell>Xác thực</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {permissions.length > 0 ? (
              permissions.map((permission, index) => (
                <TableRow key={permission.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell>
                    {permission.permissionDetails &&
                    permission.permissionDetails.length > 0
                      ? permission.permissionDetails.map((detail, i) => (
                          <span key={i}>
                            {detail.action}
                            {i < permission.permissionDetails.length - 1
                              ? ", "
                              : ""}
                          </span>
                        ))
                      : "Không có"}
                  </TableCell>
                  <TableCell>{users[permission.auths?.userId] || "-"}</TableCell>


                  <TableCell>
                    <Badge type={permission.activeFlag ? "success" : "danger"}>
                      {permission.activeFlag ? "Hoạt động" : "Ngừng hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Edit"
                        onClick={() =>
                          (window.location.href = `/app/permission/edit-permission/${permission.id}`)
                        }
                      >
                        <EditIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>
                      <Button
                        layout="link"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => handleDelete(permission.id)}
                      >
                        <TrashIcon className="w-5 h-5" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center">
                  Không có quyền nào
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

export default AllPermission;
