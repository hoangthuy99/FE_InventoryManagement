import { useHistory } from "react-router-dom";

export default function Page401() {
  const history = useHistory();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-10 rounded-2xl shadow-lg">
        <h1 className="text-6xl font-bold text-red-500">401</h1>
        <h2 className="text-2xl font-semibold mt-4">
          Bạn không có quyền truy cập
        </h2>
        <p className="text-gray-600 mt-2">
          Vui lòng liên hệ quản trị viên hoặc thử đăng nhập lại.
        </p>
        <button
          onClick={() => history.push("/")}
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Quay lại Trang Chủ
        </button>
      </div>
    </div>
  );
}
