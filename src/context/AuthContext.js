import { createContext, useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { showErrorToast } from "../components/Toast";
import { menuAPI } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [shippeprToken, setShipperToken] = useState(
    localStorage.getItem("shipperToken")
  );

  const [filteredMenu, setFilteredMenu] = useState([]);
  const [menu, setMenu] = useState([]);

  const fetchMenu = async () => {
    try {
      const res = await menuAPI.getMenuByUser();
      const data = res.data;
  
      // Kiểm tra menu có phải mảng không
      if (!Array.isArray(data)) {
        throw new Error("Menu data is not an array");
      }
  
      const result = buildMenuTree(data);
      setFilteredMenu(result);
      setMenu(data);
    } catch (error) {
      showErrorToast(error.message);
      console.error("Fetch menu error:", error);
    }
  };
  
  const buildMenuTree = (menuList, parentId = null) => {
    return menuList
      .filter(
        (menu) =>
          menu.parentId === parentId && menu.showInSidebar !== false
      )
      .map((menu) => ({
        path: menu.path,
        icon: menu.icon,
        name: menu.name,
        code: menu.code,
        routes: buildMenuTree(menuList, menu.id), // gọi đệ quy
      }));
  };
  

  const shipperLogin = (token) => {
    localStorage.setItem("shipperToken", token);
    setShipperToken(token);
  };

  const shipperLogout = () => {
    localStorage.removeItem("shipperToken");
    setShipperToken(null);
  };

  const getShipperToken = () => {
    return JSON.parse(shippeprToken);
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const getTokenInfo = () => {
    return JSON.parse(token);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        getTokenInfo,
        menu,
        filteredMenu,
        fetchMenu,
        shippeprToken,
        shipperLogin,
        shipperLogout,
        getShipperToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Middleware
export const ProtectedRoute = ({ children }) => {
  const { token, fetchMenu } = useAuth();
  let exp = 0;

  useEffect(() => {
    if (token) {
      fetchMenu();
    }
  }, []);


  if (token) {
    const { expiration } = JSON.parse(token);
    exp = expiration;
  }

  return token && exp > Date.now() ? (
    children
  ) : (
    <Redirect from="/" to="/login" />
  );
};

export const LoginSuccessRoute = ({ children }) => {
  const { token } = useAuth();
  let exp = 0;

  if (token) {
    const { expiration } = JSON.parse(token);
    exp = expiration;
  }

  return token && exp > Date.now() ? (
    <Redirect from="/" to="/app/dashboard" />
  ) : (
    children
  );
};
export const ProtectedRouteProfile = ({ children }) => {
  const { token } = useAuth();
  let exp = 0;

  if (token) {
    const { expiration } = JSON.parse(token);
    exp = expiration;
  }

  return token && exp > Date.now() ? (
    children
  ) : (
    <Redirect to="/login" />
  );
};
export const ProtectedRouteShipping = ({ children }) => {
  const { shippeprToken } = useAuth();
  let exp = 0;

  if (shippeprToken) {
    const { expiration } = JSON.parse(shippeprToken);
    exp = expiration;
  }

  return shippeprToken && exp > Date.now() ? (
    children
  ) : (
    <Redirect to="/shipping/login" />
  );
};

export const ShippingLoginSuccessRoute = ({ children }) => {
  const { shippeprToken } = useAuth();
  let exp = 0;

  if (shippeprToken) {
    const { expiration } = JSON.parse(shippeprToken);
    exp = expiration;
  }

  return shippeprToken && exp > Date.now() ? (
    <Redirect from="/" to="/shipping/tracking" />
  ) : (
    children
  );
};
