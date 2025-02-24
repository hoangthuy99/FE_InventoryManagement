import axios from "axios";

const BASE_URL = "http://localhost:8089/app";

//  Cấu hình Axios để dễ dàng tái sử dụng
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
            "Content-Type": "application/json"
        }
});

//  Function API cho từng module

//  API Category
export const categoryAPI = {
    getAll: () => api.get("/category"),
    getAllPaginated: (page, limit) => api.get(`/category?page=${page}&limit=${limit}`),
    getById: (id) => api.get(`/category/${id}`),
    create: (data) => api.post("/category", data),
    update: (id, data) => api.put(`/category/${id}`, data),
    delete: (id) => api.delete(`/category/${id}`),
};

//  API Product
export const productAPI = {
    getAll: () => api.get("/product/"),
    getAllPaginated: (page, limit) => api.get(`/product?page=${page}&limit=${limit}`),
    getById: (id) => api.get(`/product/${id}`),
    create: (data) => api.post("/product/add-product", data, {
        headers: { "Content-Type": "multipart/form-data" } // Đảm bảo hỗ trợ upload file
    }),
    update: (id, data) => api.put(`/product/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" } 
    }),
    delete: (id) => api.delete(`/product/${id}`),
};

// API Order (Đơn hàng)
export const orderAPI = {
    getAll: (customerId) => api.get(`/order/all/${customerId}`),
    getById: (id) => api.get(`/order/${id}`),
    addOrder: (customer, totalPrice) => api.post("/order/add", { customer, totalPrice }),
    saveOrder: (orderData) => api.post("/order/save", orderData),
    searchByOrderCode: (keyword) => api.get("/order/search", { params: { keyword } }),
    getByIdAndStatus: (customerId, orderId, status) => api.get(`/order/${customerId}/${orderId}/${status}`),
};
export const orderDetailAPI = {
    getAll: () => api.get("/"),
    getAllPaginated: (page, limit) => api.get(`?page=${page}&limit=${limit}`),
    getById: (id) => api.get(`/${id}`),
    getByOrderCode: (orderCode) => api.get(`/order/${orderCode}`),
    create: (data) => api.post("/", data),
    update: (id, data) => api.put(`/${id}`, data),
    delete: (id) => api.delete(`/${id}`),
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

export default api;