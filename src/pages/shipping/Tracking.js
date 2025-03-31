import { useEffect, useState } from "react";
import database from "../../config/FirebaseConfig";
import { getFirestore, getDocs, addDoc, collection } from "firebase/firestore";

function Tracking() {
  const [data, setData] = useState([]);

  const writeData = async () => {
    try {
      await addDoc(collection(database, "notification"), {
        createdAt: new Date().toISOString(),
        createdBy: "12345",
        isRead: false,
        orderId: 67890,
        sendTo: 54321,
        title: "Thông báo đơn hàng mới",
      });
      console.log("Dữ liệu đã được ghi!");
    } catch (error) {
      console.error("Lỗi khi ghi dữ liệu:", error);
    }
  };

  const getAllNotification = async () => {
    const querySnapshot = await getDocs(collection(database, "notification"));
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setData(notifications);
  };

  useEffect(() => {
    getAllNotification();
  }, []);

  console.log(database);
  console.log(data);

  return (
    <div class="bg-gray-100">
      <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-5">
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
          <div class="flex items-center">
            <i class="fas fa-bell text-white text-2xl mr-4"></i>
            <i class="fas fa-user-circle text-white text-2xl"></i>
          </div>
        </div>
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Danh sách đơn hàng</h2>
          <div class="bg-white p-3 rounded-lg shadow mb-4">
            <div class="flex items-center">
              <img
                alt="Package image"
                class="rounded-full mr-3"
                height="50"
                src="https://storage.googleapis.com/a1aa/image/wWi72MTrPMLbTia7CaK6gcCGtQJ5VImrebHBbs-LKGE.jpg"
                width="50"
              />
              <div>
                <h3 class="text-md font-semibold">Đơn hàng #12345</h3>
                <p class="text-gray-600">Trạng thái: Đang giao</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-3 rounded-lg shadow mb-4">
            <div class="flex items-center">
              <img
                alt="Package image"
                class="rounded-full mr-3"
                height="50"
                src="https://storage.googleapis.com/a1aa/image/wWi72MTrPMLbTia7CaK6gcCGtQJ5VImrebHBbs-LKGE.jpg"
                width="50"
              />
              <div>
                <h3 class="text-md font-semibold">Đơn hàng #12346</h3>
                <p class="text-gray-600">Trạng thái: Đang giao</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-3 rounded-lg shadow mb-4">
            <div class="flex items-center">
              <img
                alt="Package image"
                class="rounded-full mr-3"
                height="50"
                src="https://storage.googleapis.com/a1aa/image/wWi72MTrPMLbTia7CaK6gcCGtQJ5VImrebHBbs-LKGE.jpg"
                width="50"
              />
              <div>
                <h3 class="text-md font-semibold">Đơn hàng #12347</h3>
                <p class="text-gray-600">Trạng thái: Đang giao</p>
              </div>
            </div>
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
              <h2 class="text-lg font-semibold">Đơn hàng #12345</h2>
              <p class="text-gray-600">Trạng thái: Đang giao</p>
            </div>
          </div>
          <div class="flex items-center mb-4">
            <i class="fas fa-clock text-blue-500 text-2xl mr-3"></i>
            <div>
              <h2 class="text-lg font-semibold">ETA</h2>
              <p class="text-gray-600">15 mins</p>
            </div>
          </div>
          <button class="w-full bg-blue-500 text-white py-2 rounded-lg">
            Cập nhật trạng thái
          </button>
        </div>
      </div>
      <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-5">
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Mã đơn hàng</h3>
            <p class="text-gray-600">#12345</p>
          </div>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Trạng thái</h3>
            <p class="text-gray-600">Đang giao</p>
          </div>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Địa chỉ giao hàng</h3>
            <p class="text-gray-600">456 Elm St, Springfield</p>
          </div>
          <div class="mb-4">
            <h3 class="text-md font-semibold">Thời gian dự kiến</h3>
            <p class="text-gray-600">15 mins</p>
          </div>
          <div class="flex justify-around mt-4">
            <button class="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center">
              <i class="fas fa-phone-alt mr-2"></i>
              Gọi
            </button>
            <button class="bg-green-500 text-white py-2 px-4 rounded-lg flex items-center">
              <i class="fas fa-comment-dots mr-2"></i>
              Nhắn tin
            </button>
            <button
              onClick={writeData}
              class="bg-yellow-500 text-white py-2 px-4 rounded-lg flex items-center"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tracking;
