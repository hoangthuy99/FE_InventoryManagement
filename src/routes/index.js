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
const Buttons = lazy(() => import("../pages/Buttons"));
const Modals = lazy(() => import("../pages/Modals"));
const Tables = lazy(() => import("../pages/Tables"));
const Page404 = lazy(() => import("../pages/404"));
const Cards = lazy(() => import("../pages/Cards"));
const Forms = lazy(() => import("../pages/Forms"));
const { roleTags } = data;

const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/category/all-category",
    component: AllCategory,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/category/add-category",
    component: AddCategory,
    roles: [roleTags.role_amdin],
  },

  {
    path: "/category/edit-category/:id",
    component: EditCategory,
    roles: [roleTags.role_amdin],
  },

  {
    path: "/product/add-product",
    component: AddProductInfo,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/product/all-product",
    component: AllProduct,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/product/edit-product/:id",
    component: EditProduct,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/order/all-orders",
    component: AllOrders,
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },

  {
    path: "/order/add-order/:id?",
    component: AddOrder,
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/order/edit-order/:id",
    component: EditOrder,
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/customer/add-customer",
    component: AddCustomer,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/customer/all-customer",
    component: AllCustomer,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/customer/edit-customer/:id",
    component: EditCustomer,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/branch/add-branch",
    component: AddBranch,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/branch/all-branch",
    component: AllBranch,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/branch/edit-branch/:id",
    component: EditBranch,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/purchase/add-purchase/:id?",
    component: AddPurchase,
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/purchase/all-purchase",
    component: AllPurchase,
    roles: [roleTags.role_amdin, roleTags.role_staff],
  },
  {
    path: "/supplier/add-supplier",
    component: AddSupplier,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/supplier/all-supplier",
    component: AllSupplier,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/supplier/edit-supplier/:id",
    component: EditSupplier,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/map",
    component: MapLayer,
    roles: [roleTags.role_amdin],
  },
  
  {
    path: "*",
    component: Page404,
  },
];

export default routes;
