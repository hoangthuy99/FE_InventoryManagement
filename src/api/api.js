import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:8089/app";

//  Cấu hình Axios để dễ dàng tái sử dụng
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  create: (data) => api.post("/branch", data),
  update: (id, data) => api.put(`/branch/${id}`, data),
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
  saveOrder: (orderData) => api.post("/order/save", orderData),
  searchByOrderCode: (keyword) =>
    api.get("/order/search", { params: { keyword } }),
  getByIdAndStatus: (customerId, orderId, status) =>
    api.get(`/order/${customerId}/${orderId}/${status}`),
};

// API Invoice
export const invoiceAPI = {
  getAll: () => api.get("/invoice"),
  getById: (id) => api.get(`/invoice/${id}`),
  create: (data) => api.post("/invoice", data),
};

//  API User
export const userAPI = {
  getAll: () => api.get("/user"),
  getById: (id) => api.get(`/user/${id}`),
  create: (data) => api.post("/user", data),
  update: (id, data) => api.put(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
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
  getById: (id) => api.get(`/supplier/getSupplier/${id}`),
  getAllPaginated: (page, limit) =>
    api.get(`/supplier/getAll?page=${page}&limit=${limit}`),
  add: (supplierData) => api.post("/supplier/add", supplierData),
  update: (id, supplierData) => api.put(`/supplier/update/${id}`, supplierData),
  delete: (id) => api.delete(`/supplier/delete/${id}`),
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

export default api;
