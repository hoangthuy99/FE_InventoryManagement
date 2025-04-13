import { useEffect, useRef, useState } from "react";
import database from "../../config/FirebaseConfig";
import {
  getFirestore,
  getDocs,
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  doc,
} from "firebase/firestore";
import { orderAPI } from "../../api/api";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import data from "../../assets/data.json";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { OutlineLogoutIcon } from "../../icons";

const filterStatus = {
  6: [6, 7, 8, 9], // Đang chờ giao -> Đã giao
  7: [7, 8, 9], // Đã giao -> Đã hoàn thành hoặc Đã hủy
  8: [8],
  9: [9],
};

function Tracking() {
  const { getShipperToken, shipperLogout } = useAuth();
  const { code, accessToken } = getShipperToken();
  const [orders, setOrders] = useState([]);
  const [orderSelected, setOrderSelected] = useState({});
  const [validStatus, setValidStatus] = useState([...filterStatus[6]]);
  const notiRef = collection(database, "notification");
  const q = query(notiRef, where("sendTo", "==", code));
  const { orStatus } = data;
  const status = orStatus.reduce((acc, o) => {
    acc[o.key] = o.name;
    return acc;
  }, {});
  const firstRender = useRef(true);
  const [updateMode, setUpdateMode] = useState(false);
  const [statusChange, setStatusChange] = useState();

  const getOrdersByIdList = async (ids) => {
    try {
      const response = await orderAPI.getByIdList(ids, accessToken);
      const data = response.data;

      if (data.code === 200) {
        setOrders(data?.data);
        setOrderSelected(data?.data[0]);
      }
    } catch (error) {
      showErrorToast(
        "Đã xảy ra lỗi trong khi lấy dữ liệu đơn hàng: ",
        error.message
      );
    }
  };

  // Get notification by self
  const getSelfNotification = async () => {
    try {
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      console.log("Notifications:", notifications);
      getOrdersByIdList(notifications.map((n) => n.orderId).join(","), accessToken);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  };

  useEffect(() => {
    getSelfNotification();
  }, []);

  // Handle realtime when db changed
  useEffect(() => {
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }

      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const docData = change.doc.data();

          const response = await orderAPI.getById(docData.orderId);
          setOrders((prev) => [response.data,...prev]);

          showSuccessToast(docData.title);
        }
        if (change.type === "removed") {
          console.log(change.doc);
        }
      });
    });

    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    if (orderSelected) {
      setValidStatus(filterStatus[orderSelected?.status]);
      setStatusChange(orderSelected?.status);
    }
  }, [orderSelected]);

  const handleChangeStatus = (status) => {
    setStatusChange(status);
  };

  const calculateTotalPrice = (items) => {
    return items.reduce((sum, item) => (sum += item.totalPrice || 0), 0);
  };

  const handleUpdateOrder = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn sửa đơn đặt hàng này?")) return;

    try {
      const totalPrice = calculateTotalPrice(orderSelected.orderDetails);

      const dataRequest = {
        id: orderSelected.id,
        customerId: orderSelected.customer.id,
        branchId: orderSelected.branch.id,
        shipperId: orderSelected.shipper.id,
        plannedExportDate: orderSelected.plannedExportDate,
        actualExportDate: orderSelected.actualExportDate,
        deliveryAddress: orderSelected.deliveryAddress,
        totalPrice,
        status: statusChange,
        note: orderSelected.note,
        orderDetailsRequest: orderSelected.orderDetails.map((item) => ({
          id: item.id,
          productId: item.productInfo.id,
          qty: item.qty,
          productUnit: item.productUnit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          deleteFg: item.deleteFg,
        })),
      };

      const res = await orderAPI.updateOrder(dataRequest);
      const data = res.data;

      if (data.code === 200) {
        showSuccessToast(`Cập nhật đơn hàng thành công`);
        setUpdateMode(false);
        sendNoti();
        getOrdersByIdList(orders.map((o) => o.id).join(","));
      }
    } catch (error) {
      console.error("Lỗi API:", error);
      showErrorToast("Lỗi khi cập nhật đơn hàng");
    }
  };

  // Send notification to owner of order
  const sendNoti = async () => {
    try {
      await addDoc(collection(database, "notification"), {
        createdAt: new Date().toISOString(),
        createdBy: orderSelected.shipper.code,
        isRead: false,
        orderId: orderSelected.id,
        orderCode: orderSelected.orderCode,
        sendTo: orderSelected.createdBy.username,
        title: "Đã cập nhật trạng thái sang " + status[orderSelected?.status],
      });
      console.log("Dữ liệu đã được ghi!");
    } catch (error) {
      console.error("Lỗi khi ghi dữ liệu:", error);
    }
  };

  return (
    <div class="bg-gray-100">
      <div class="max-w-md mx-auto bg-white shadow-lg overflow-hidden">
        <div class="bg-blue-500 p-4 flex items-center justify-between">
          <div class="flex items-center">
            <img
              alt="App logo"
              class="rounded-full"
              height="40"
              src="https://storage.googleapis.com/a1aa/image/bRLj7DEdZLDEb9pwtdV1cG89uapOj9ne3-bSjT2Spv0.jpg"
              width="40"
            />
            <h1 class="text-white text-xl font-bold ml-3">Shipper App</h1>
          </div>
          <div
            onClick={() => shipperLogout()}
            class="flex items-center text-white cursor-pointer hover:text-red-500"
          >
            <OutlineLogoutIcon className="w-4 h-4" aria-hidden="true" />
            <span>Log out</span>
          </div>
        </div>
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Danh sách đơn hàng</h2>
          <div className="max-h-64 overflow-y-scroll overflow-hidden">
            {orders &&
              orders.map((o) => (
                <div
                  onClick={() => setOrderSelected(o)}
                  class={
                    "p-3 rounded-lg shadow cursor-pointer mb-4 " +
                    (orderSelected?.id === o?.id ? " bg-gray-300" : " bg-white")
                  }
                >
                  <div class="flex items-center">
                    <img
                      alt="Package image"
                      class="rounded-full mr-3"
                      height="50"
                      src="https://tse3.mm.bing.net/th?id=OIP.9YGf5zV6GpSu1_Fsjs8mUQHaHa&pid=Api&P=0&h=220"
                      width="50"
                    />
                    <div>
                      <h3 class="text-md font-semibold">
                        Đơn hàng {o?.orderCode}
                      </h3>
                      <p class="text-gray-600">
                        Trạng thái: {status[o?.status]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div class="bg-gray-200 p-4 flex justify-around">
          <div class="text-center">
            <i class="fas fa-box text-blue-500 text-2xl"></i>
            <p class="text-blue-500 text-sm">Đơn hàng</p>
          </div>
          <div class="text-center">
            <i class="fas fa-map-marker-alt text-gray-600 text-2xl"></i>
            <p class="text-gray-600 text-sm">Theo dõi</p>
          </div>
          <div class="text-center">
            <i class="fas fa-history text-gray-600 text-2xl"></i>
            <p class="text-gray-600 text-sm">Lịch sử</p>
          </div>
          <div class="text-center">
            <i class="fas fa-user text-gray-600 text-2xl"></i>
            <p class="text-gray-600 text-sm">Hồ sơ</p>
          </div>
        </div>
      </div>
      <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-5">
        <div class="h-64">
          <img
            alt="Map showing shipper's location"
            class="w-full h-full object-cover"
            height="300"
            src="https://storage.googleapis.com/a1aa/image/By6I3fkufKnTwGbUh_DQIZeMShTwNEGeP0tRBX2JJvY.jpg"
            width="400"
          />
        </div>
        <div class="p-4">
          <div class="flex items-center mb-4">
            <i class="fas fa-box text-blue-500 text-2xl mr-3"></i>
            <div>
              <h2 class="text-lg font-semibold">
                Đơn hàng {orderSelected?.orderCode}
              </h2>
              <p class="text-gray-600">
                Trạng thái: {status[orderSelected?.status]}
              </p>
            </div>
          </div>
          <div class="flex items-center mb-4">
            <i class="fas fa-clock text-blue-500 text-2xl mr-3"></i>
            <div>
              <h2 class="text-lg font-semibold">ETA</h2>
              <p class="text-gray-600">15 mins</p>
            </div>
          </div>
          {updateMode ? (
            <button
              onClick={() => {
                setStatusChange(orderSelected?.status);
                setUpdateMode(false);
              }}
              class={
                "w-full bg-gray-400 text-white py-2 rounded-lg " +
                ([8, 9].includes(orderSelected?.status) ? " hidden" : "")
              }
            >
              Hủy cập nhật trạng thái
            </button>
          ) : (
            <button
              onClick={() => setUpdateMode(true)}
              class={
                "w-full bg-blue-500 text-white py-2 rounded-lg " +
                ([8, 9].includes(orderSelected?.status) ? " hidden" : "")
              }
            >
              Cập nhật trạng thái
            </button>
          )}
        </div>
      </div>
      <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-5">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Mã đơn hàng</h3>
            <p class="text-gray-600">{orderSelected?.orderCode}</p>
          </div>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Trạng thái</h3>
            {updateMode ? (
              <FormControl fullWidth>
                <Select
                  value={statusChange}
                  className="text-gray-600 dark:text-gray-300"
                  onChange={(e) => handleChangeStatus(e.target.value)}
                >
                  {orStatus.map(
                    (status) =>
                      validStatus?.includes(status.key) && (
                        <MenuItem key={status.key} value={status.key}>
                          {status.name}
                        </MenuItem>
                      )
                  )}
                </Select>
              </FormControl>
            ) : (
              <p class="text-gray-600">{status[orderSelected?.status]}</p>
            )}
          </div>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Địa chỉ giao hàng</h3>
            <p class="text-gray-600">{orderSelected?.deliveryAddress}</p>
          </div>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Thời gian dự kiến</h3>
            <p class="text-gray-600">15 mins</p>
          </div>
          <div class="flex justify-around mt-4">
            <button class="bg-blue-500 text-white py-2 px-4 rounded-lg  text-center">
              <a href={`tel:${orderSelected?.customer?.phone}`}>Gọi</a>
            </button>
            <button class="bg-green-500 text-white py-2 px-4 rounded-lg  text-center">
              Nhắn tin
            </button>
            <button
              onClick={handleUpdateOrder}
              class="bg-yellow-500 text-white py-2 px-4 rounded-lg  text-center"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracking;
