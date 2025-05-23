import { Box } from "@mui/material";
import { authAPI } from "../../api/api";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { showErrorToast, showSuccessToast } from "../../components/Toast";
import { GoogleLogin } from "@react-oauth/google";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
function ShipperLogin() {
  const history = useHistory();
  const { shipperLogin } = useAuth();
  console.log("CLIENT_ID:", CLIENT_ID);

  const handleLoginGoogle = async (response) => {
    console.log("Google Token:", response.credential);

    try {
      const res = await authAPI.loginOauth(response.credential);

      if (res.status === 200) {
        const { exp } = jwtDecode(res.data?.data.accessToken); // Kiểm tra lỗi
        const token = JSON.stringify({
          accessToken: response.credential,
          expiration: Date.now() + exp,
          ...res.data?.data,
        });
        shipperLogin(token);
        showSuccessToast("Login successfully");
        history.push("/shipping/tracking");
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-bold text-center text-blue-600">
          Đăng nhập Shipper
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Sử dụng tài khoản Google của bạn để đăng nhập
        </p>

        <div className="">
          <GoogleLogin
            onSuccess={handleLoginGoogle}
            onError={() => showErrorToast("Login failed")}
          />
        </div>
      </div>
    </div>
  );
}

export default ShipperLogin;
