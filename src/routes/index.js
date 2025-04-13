
import { lazy } from "react";
import AddPurchase from "../pages/purchaseOrder/AddPurchase";
import AllPurchase from "../pages/purchaseOrder/AllPurchase";
import MapLayer from "../pages/map";
import EditOrder from "../pages/order/AddOrder";
import data from "../assets/data.json";

// Import các component
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AllCategory = lazy(() => import("../pages/category/AllCategory"));
const AddCategory = lazy(() => import("../pages/category/AddCategory"));
const EditCategory = lazy(() => import("../pages/category/Editcategory"));
const AddProductInfo = lazy(() => import("../pages/product/AddProductInfo"));
const AllProduct = lazy(() => import("../pages/product/AllProduct"));
const EditProduct = lazy(() => import("../pages/product/EditProduct"));
const AddOrder = lazy(() => import("../pages/order/AddOrder"));
const AllOrders = lazy(() => import("../pages/order/AllOrders"));
const AddCustomer = lazy(() => import("../pages/customer/AddCustomer"));
const AllCustomer = lazy(() => import("../pages/customer/AllCustomer"));
const EditCustomer = lazy(() => import("../pages/customer/EditCustomer"));
const AddBranch = lazy(() => import("../pages/branch/AddBranch"));
const AllBranch = lazy(() => import("../pages/branch/AllBranch"));
const EditBranch = lazy(() => import("../pages/branch/EditBranch"));
const AddSupplier = lazy(() => import("../pages/supplier/AddSupplier"));
const AllSupplier = lazy(() => import("../pages/supplier/AllSupplier"));
const EditSupplier = lazy(() => import("../pages/supplier/EditSupplier"));
const AllUser = lazy(() => import("../pages/user/AllUser"));
const EditUser = lazy(() => import("../pages/user/EditUser"));
const AllMenu = lazy(() => import("../pages/menu/AllMenu"));
const EditMenu = lazy(() => import("../pages/menu/EditMenu"));
const Tracking = lazy(() => import("../pages/shipping/Tracking"));

const Page404 = lazy(() => import("../pages/404"));
const { roleTags } = data;

const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
    code: "DASHBOARD",
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/category/all-category",
    component: AllCategory,
    code: "ALL_CATEGORY",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/category/add-category",
    component: AddCategory,
    code: "ADD_CATEGORY",
    roles: [roleTags.role_amdin],
  },

  {
    path: "/category/edit-category/:id?",
    component: EditCategory,
    code: "EDIT_CATEGORY",
    roles: [roleTags.role_amdin],
  },

  {
    path: "/product/add-product",
    component: AddProductInfo,
    code: "ADD_PRODUCT",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/product/all-product",
    component: AllProduct,
    code: "ALL_PRODUCT",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/product/edit-product/:id?",
    component: EditProduct,
    code: "EDIT_PRODUCT",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/order/all-orders",
    component: AllOrders,
    code: "ALL_ORDERS",
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },

  {
    path: "/order/add-order/:id?",
    component: AddOrder,
    code: "ADD_ORDER",
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/order/edit-order/:id?",
    component: EditOrder,
    code: "EDIT_ORDER",
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/customer/add-customer",
    component: AddCustomer,
    code: "ADD_CUSTOMER",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/customer/all-customer",
    component: AllCustomer,
    code: "ALL_CUSTOMER",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/customer/edit-customer/:id?",
    component: EditCustomer,
    code: "EDIT_CUSTOMER",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/branch/add-branch",
    component: AddBranch,
    code: "ADD_BRANCH",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/branch/all-branch",
    component: AllBranch,
    code: "ALL_BRANCH",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/branch/edit-branch/:id?",
    component: EditBranch,
    code: "EDIT_BRANCH",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/purchase/add-purchase/:id?",
    component: AddPurchase,
    code: "ADD_PURCHASE",
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/purchase/all-purchase",
    component: AllPurchase,
    code: "ALL_PURCHASE",
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/supplier/add-supplier",
    component: AddSupplier,
    code: "ADD_SUPPLIER",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/supplier/all-supplier",
    component: AllSupplier,
    code: "ALL_SUPPLIER",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/supplier/edit-supplier/:id?",
    component: EditSupplier,
    code: "EDIT_SUPPLIER",
    roles: [roleTags.role_amdin],
  },

  {
    path: "/user/all-user",
    component: AllUser,
    code: "ALL_EMPLOYEE",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/user/edit-user/:id?",
    component: EditUser,
    code: "ADD_EMPLOYEE",
    roles: [roleTags.role_amdin],
  },

  {
    path: "/menus/all-menu",
    component: AllMenu,
    code: "ALL_MENU",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/menus/edit-menu/:id?",
    component: EditMenu,
    code: "EDIT_MENU",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/map",
    component: MapLayer,
    code: "MAP",
    roles: [roleTags.role_amdin],
  },
  {
    path: "/shipping/tracking",
    component: Tracking,
    code: "TRACKING",
    roles: [roleTags.role_amdin],
  },
];

export default routes;
