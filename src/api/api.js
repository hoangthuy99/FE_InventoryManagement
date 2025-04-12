import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { showErrorToast } from "../components/Toast";

const BASE_URL = `${process.env.REACT_APP_BASE_URL}/app`;

//  Cấu hình Axios để dễ dàng tái sử dụng
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor vào request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc Redux, Context API...)
    const token = JSON.parse(localStorage.getItem("token"))?.accessToken || "";

    // Nếu có token, thêm vào header Authorization
    console.log(config.url);
    
    if (token && !config.url.includes("/auth/oauth-login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    // Xử lý lỗi trước khi request được gửi đi
    return Promise.reject(error);
  }
);

// Interceptor cho response (Kiểm tra lỗi 401 Unauthorized)
api.interceptors.response.use(
  (response) => response // Trả về response nếu thành công
);

//  Function API cho từng module
//  API Category
export const customerAPI = {
  getAll: () => api.get("/customer"),
  getAllPaginated: (page, limit) =>
    api.get(`/customer?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/customer/${id}`),
  create: (data) => api.post("/customer", data),
  update: (id, data) => api.put(`/customer/${id}`, data),
  delete: (id) => api.delete(`/customer/${id}`),
  getSampleFile: () => api.get("/customer/sampleExcel"),
  importExcel: (data) =>
    api.post("/customer/importExcel", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export const branchAPI = {
  getAll: () => api.get("/branch"),
  getAllPaginated: (page, limit) =>
    api.get(`/branch?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/branch/${id}`),
  create: (data) =>
    api.post("/branch", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/branch/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/branch/${id}`),
  getByActiveFlag: () => api.get("/branch/active"),
  searchByName: (keyword) => api.get(`/branch/search?keyword=${keyword}`),
  getSampleFile: () => api.get("/branch/sampleExcel"),
  importExcel: (data) =>
    api.post("/branch/importExcel", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

//  API Category
export const categoryAPI = {
  getAll: () => api.get("/category"),
  getAllPaginated: (page, limit) =>
    api.get(`/category?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/category/${id}`),
  create: (data) => api.post("/category/add-category", data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
  getSampleFile: () => api.get("/category/sampleExcel"),
  importExcel: (data) =>
    api.post("/category/importExcel", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  searchCategories: (data) => api.post("/category/searchCategories", data),
};

//  API Product
export const productAPI = {
  getAll: () => api.get("/product"),
  getAllPaginated: (page, limit) =>
    api.get(`/product?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/product/${id}`),
  create: (data) =>
    api.post("/product/add-product", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }), // Đảm bảo hỗ trợ upload file
  update: (id, data) =>
    api.put(`/product/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/product/${id}`),
  importExcel: (data) =>
    api.post("/product/importExcel", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getSampleFile: () => api.get("/product/sampleExcel"),
};

export const orderAPI = {
  getAll: () => api.get("/order/"),
  getAllPaginated: (page, limit) =>
    api.get(`/order/?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/order/${id}`),
  saveOrder: (orderData) => api.post("/order/createOrder", orderData),
  updateOrder: (orderData) => api.put("/order/updateOrder", orderData),
  updateOrderStatus: (orderId, newStatus) =>
    api.put(`/order/${orderId}/status`, { newStatus }),
  searchByOrderCode: (keyword) =>
    api.get("/order/search", { params: { keyword } }),
  getByIdAndStatus: (customerId, orderId, status) =>
    api.get(`/order/${customerId}/${orderId}/${status}`),
  delete: (id) => api.delete(`/order/${id}`),
  getByIdList: (ids) => api.get(`order/getByIdList?ids=${ids}`),
};

//  API User
export const userAPI = {
  getAll: () => api.get("/user"),
  search: (data) => api.post("/user/search", data),
  getById: (id) => api.get(`/user/${id}`),
  update: (id, data) => api.put(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
  getAllUserGoogle: () => api.get("/user/getAllUsersGG"),
};

// API menu
export const menuAPI = {
  search: (data) => api.post("/menu/search", data),
  getAll: () => api.get("/menu"),
  getById: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post("/menu", data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
  importExcel: (data) =>
    api.post("/menu/importExcel", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getSampleFile: () => api.get("/menu/sampleExcel"),
  getMenuByUser: () => api.get("/menu/getMenuByUser"),
};

//API permissions
export const roleAPI = {
  search: (data) => api.post("/role/search", data),
  getAllRoles: () => api.get("/role/"),
  getById: (id) => api.get(`/role/${id}`),
  getByName: (name) => api.get(`/role/name/${name}`),
  create: (data) => api.post("/role/create", data),
  update: (id, data) => api.put(`/role/${id}`, data),
  delete: (id) => api.delete(`/role/${id}`),
};

// API Auth
export const authAPI = {
  login: (data, token) => api.post("/auth/login", data),
  loginOauth: (token) =>
    api.post(
      "/auth/oauth-login",
      {},
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    ),
  register: (data) => api.post("/auth/register", data),
  registerOauth: (token) =>
    api.post(
      "/auth/oauth-register",
      {},
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    ),
};

// API Supplier
export const supplierAPI = {
  getAll: () => api.get("/supplier/getAllSuppliers"),
  getById: (id) => api.get(`/supplier/${id}`),
  getAllPaginated: (page, limit) =>
    api.get(`/supplier/getAllSuppliers?page=${page}&limit=${limit}`),
  add: (supplierData) => api.post("/supplier/add-supplier", supplierData),
  update: (id, supplierData) => api.put(`/supplier/${id}`, supplierData),
  delete: (id) => api.delete(`/supplier/${id}`),
};

// API Purchase Order
export const purchaseOrderAPI = {
  addNew: (data) => api.post("/purchase-order/createPurchaseOrder", data),
  update: (data) => api.put("/purchase-order/updatePurchaseOrder", data),
  search: (data) => api.post("/purchase-order/searchPurchaseOrder", data),
  deleteById: (id) => api.delete(`/purchase-order/deleteById/${id}`),
  getById: (id) => api.get(`/purchase-order/getById/${id}`),
};

// API Area
export const areaAPI = {
  getAll: () => api.get("/area/list"),
  getByBranch: (branchId) => api.get(`/area/getByBranch/${branchId}`),
  createOrUpdate: (branchId, data) =>
    api.post(`/area/createOrUpdate/${branchId}`, data),
  deleteMulti: (id) => api.delete(`/area/delete?ids=${id}`),
};

// API Dashboard
export const dashboardAPI = {
  getTotalBussiness: () => api.get("/statistic/getTotalBussiness"),
  getTotalOrderStatus: () => api.get("/statistic/getTotalOrderStatus"),
  getTotalRevenue: (filterType) =>
    api.get(`/statistic/getTotalRevenue/${filterType}`),
};

export default api;
