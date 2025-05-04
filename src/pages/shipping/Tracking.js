import { useEffect, useRef, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
} from "firebase/database";
import { orderAPI } from "../../api/api";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import data from "../../assets/data.json";
import { FormControl, MenuItem, Select } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { OutlineLogoutIcon } from "../../icons";
import { db } from "../../config/FirebaseConfig";
import { all } from "axios";

const filterStatus = {
  6: [6, 7, 8, 9],
  7: [7, 8, 9],
  8: [8],
  9: [9],
};

function Tracking() {
  const { getShipperToken, shipperLogout } = useAuth();
  const { code, accessToken } = getShipperToken();

  const [orders, setOrders] = useState([]);
  const [orderSelected, setOrderSelected] = useState({});
  const [validStatus, setValidStatus] = useState([]);
  const [updateMode, setUpdateMode] = useState(false);
  const [notis, setNotis] = useState([]);
  const [orderIds, setOrderIds] = useState([]);
  const [statusChange, setStatusChange] = useState();
  const firstRender = useRef(true);
  const { orStatus } = data;

  const statusMap = orStatus.reduce((acc, o) => {
    acc[o.key] = o.name;
    return acc;
  }, {});

  const getOrdersByIds = async (ids) => {
    try {
      console.log("Đang gọi API với IDs:", ids);  // Log kiểm tra
      const res = await orderAPI.getByIdList(ids, accessToken);
      if (res.data.code === 200 && res.data.data.length > 0) {
        setOrders(res.data.data);
        setOrderSelected(res.data.data[0]);
      } else {
        setOrders([]);
        setOrderSelected(null);
        console.log("Không tìm thấy đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    }
  };
  console.log("Order IDs từ Firebase:", orderIds);   
 


  useEffect(() => {
    if (orderSelected) {
      setValidStatus(filterStatus[orderSelected.status] || []);
      setStatusChange(orderSelected.status);
    }
  }, [orderSelected]);

  const calculateTotalPrice = (items) =>
    items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const handleUpdateOrder = async () => {
    if (!window.confirm("Xác nhận cập nhật đơn hàng?")) return;

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

      await set(ref(db, `order/${orderSelected.id}`), {
        id: orderSelected.id,
        orderCode: orderSelected.orderCode,
        status: statusChange,
        customer: {
          name: orderSelected.customer.name,
          phone: orderSelected.customer.phone,
        },
        shipper: {
          code: orderSelected.shipper.code,
          name: orderSelected.shipper.name,
        },
        address: orderSelected.deliveryAddress,
        updatedAt: new Date().toISOString(),
      });

      const res = await orderAPI.updateOrder(dataRequest);
      console.log("Đang lưu notification với orderId:", orderSelected.id);

      if (res.data.code === 200) {
        showSuccessToast("Cập nhật thành công");
        await sendNotification();
        setUpdateMode(false);
        setOrderSelected((prev) => ({ ...prev, status: statusChange }));
        await getOrdersByIds(orders.map((o) => o.id));
      }
    } catch (err) {
      showErrorToast("Lỗi cập nhật đơn hàng");
      console.error(err);
    }
  };
  

  const sendNotification = async () => {
    try {
      console.log("Gửi notification với orderId:", orderSelected.id); // log kiểm tra
      const notiRef = push(ref(db, "notification"));
      await set(notiRef, {
        createdAt: new Date().toISOString(),
        createdBy: orderSelected.shipper.code,
        isRead: false,
        orderId: orderSelected.id,  // PHẢI LÀ SỐ 3 (id backend)
        orderCode: orderSelected.orderCode,
        sendTo: code,  // shipper code
        title: `Đã cập nhật trạng thái sang ${statusMap[statusChange]}`,
      });
    } catch (err) {
      console.error("Lỗi gửi notification:", err);
    }
  };
  
  useEffect(() => {
    const { code: shipperCode } = getShipperToken();  // Lấy shipperCode từ AuthContext
    const notiRef = ref(db, `notifications/${shipperCode}`);  // Đọc thông báo từ Firebase theo shipperCode
    console.log("Đang đọc thông báo từ Firebase với shipperCode:", shipperCode); // log kiểm tra  
    console.log("Đang đọc thông báo từ path:", `notifications/${shipperCode}`);
  
  
    const unsubscribe = onValue(notiRef, async (snapshot) => {
      const allNotis = snapshot.val();
  
      if (!allNotis) return;
  
      const shipperNotis = Object.values(allNotis);
      console.log("Notification đọc được:", shipperNotis);
  
      const ids = shipperNotis.map((n) => n.orderId);
      console.log("Order IDs gửi API:", ids);
  
      setNotis(shipperNotis);
      setOrderIds(ids);
  
      if (ids.length > 0) {
        await getOrdersByIds(ids);
        if (!firstRender.current) {
          showSuccessToast("Bạn có đơn hàng mới!");
        }
      }
  
      firstRender.current = false;
    });
  
    return () => unsubscribe();
  }, [code]);
  

  

  return (
    <div className="bg-gray-100">
      {/* Header */}
      <div className="max-w-md mx-auto overflow-hidden bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 bg-blue-500">
          <div className="flex items-center">
            <img
              alt="App logo"
              className="rounded-full"
              src="https://storage.googleapis.com/a1aa/image/bRLj7DEdZLDEb9pwtdV1cG89uapOj9ne3-bSjT2Spv0.jpg"
              width="40"
              height="40"
            />
            <h1 className="ml-3 text-xl font-bold text-white">Shipper App</h1>
          </div>
          <div
            onClick={shipperLogout}
            className="flex items-center text-white cursor-pointer hover:text-red-500"
          >
            <OutlineLogoutIcon className="w-4 h-4" />
            <span>Log out</span>
          </div>
        </div>

        {/* Danh sách đơn */}
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold">Danh sách đơn hàng</h2>
          <div className="overflow-y-scroll max-h-64">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => setOrderSelected(o)}
                className={`p-3 mb-4 cursor-pointer rounded-lg shadow ${
                  orderSelected?.id === o.id ? "bg-gray-300" : "bg-white"
                }`}
              >
                <div className="flex items-center">
                  <img
                    alt="Package"
                    className="mr-3 rounded-full"
                    src="https://tse3.mm.bing.net/th?id=OIP.9YGf5zV6GpSu1_Fsjs8mUQHaHa"
                    width="50"
                    height="50"
                  />
                  <div>
                    <h3 className="font-semibold text-md">Đơn hàng {o.orderCode}</h3>
                    <p className="text-gray-600">Trạng thái: {statusMap[o.status]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="flex justify-around p-4 bg-gray-200">
          {["fa-box", "fa-map-marker-alt", "fa-history", "fa-user"].map((icon, i) => (
            <div key={i} className="text-center">
              <i className={`text-2xl ${i === 0 ? "text-blue-500" : "text-gray-600"} fas ${icon}`}></i>
              <p className={`text-sm ${i === 0 ? "text-blue-500" : "text-gray-600"}`}>
                {["Đơn hàng", "Theo dõi", "Lịch sử", "Hồ sơ"][i]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Map + Thông tin đơn hàng */}
      <div className="max-w-md mx-auto mt-5 bg-white rounded-lg shadow-lg">
        <img
          alt="Map"
          className="object-cover w-full h-64"
          src="https://storage.googleapis.com/a1aa/image/By6I3fkufKnTwGbUh_DQIZeMShTwNEGeP0tRBX2JJvY.jpg"
        />
        <div className="p-4">
          <div className="flex items-center mb-4">
            <i className="mr-3 text-2xl text-blue-500 fas fa-box"></i>
            <div>
              <h2 className="text-lg font-semibold">Đơn hàng {orderSelected?.orderCode}</h2>
              <p className="text-gray-600">Trạng thái: {statusMap[orderSelected?.status]}</p>
            </div>
          </div>
          <button
            onClick={() => setUpdateMode((prev) => !prev)}
            className={`w-full py-2 rounded-lg text-white ${
              updateMode ? "bg-gray-400" : "bg-blue-500"
            } ${([8, 9].includes(orderSelected?.status)) && "hidden"}`}
          >
            {updateMode ? "Hủy cập nhật trạng thái" : "Cập nhật trạng thái"}
          </button>
        </div>
      </div>

      {/* Chi tiết đơn */}
      <div className="max-w-md p-4 mx-auto mt-5 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Thông tin đơn hàng</h2>

        <div className="mb-4">
          <h3 className="font-semibold text-md">Mã đơn hàng</h3>
          <p className="text-gray-600">{orderSelected?.orderCode}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-md">Trạng thái</h3>
          {updateMode ? (
            <FormControl fullWidth>
              <Select
                value={statusChange}
                onChange={(e) => setStatusChange(e.target.value)}
              >
                {orStatus
                  .filter((s) => validStatus.includes(s.key))
                  .map((s) => (
                    <MenuItem key={s.key} value={s.key}>
                      {s.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <p className="text-gray-600">{statusMap[orderSelected?.status]}</p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-md">Địa chỉ giao hàng</h3>
          <p className="text-gray-600">{orderSelected?.deliveryAddress}</p>
        </div>

        <div className="flex justify-around mt-4">
          <button className="px-4 py-2 text-white bg-blue-500 rounded-lg">
            <a href={`tel:${orderSelected?.customer?.phone}`}>Gọi</a>
          </button>
          <button className="px-4 py-2 text-white bg-green-500 rounded-lg">Nhắn tin</button>
          <button
            onClick={handleUpdateOrder}
            className="px-4 py-2 text-white bg-yellow-500 rounded-lg"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}

export default Tracking;
