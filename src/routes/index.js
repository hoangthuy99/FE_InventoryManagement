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
const AllPermission = lazy(() => import("../pages/permission/AllPermission"));
const AddPermission = lazy(() => import("../pages/permission/AddPermission"));
const AllMenu = lazy(() => import("../pages/menus/AllMenu"));


const Page404 = lazy(() => import("../pages/404"));
const { roleTags } = data;

const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
    roles: [roleTags.role_admin, roleTags.role_staff],
  },
  {
    path: "/category/all-category",
    component: AllCategory,
    roles: [roleTags.role_admin],
  },
  {
    path: "/category/add-category",
    component: AddCategory,
    roles: [roleTags.role_admin],
  },

  {
    path: "/category/edit-category/:id",
    component: EditCategory,
    roles: [roleTags.role_admin],
  },

  {
    path: "/product/add-product",
    component: AddProductInfo,
    roles: [roleTags.role_admin],
  },
  {
    path: "/product/all-product",
    component: AllProduct,
    roles: [roleTags.role_admin],
  },
  {
    path: "/product/edit-product/:id",
    component: EditProduct,
    roles: [roleTags.role_admin],
  },
  {
    path: "/order/all-orders",
    component: AllOrders,
    roles: [roleTags.role_admin, roleTags.role_staff],
  },

  {
    path: "/order/add-order/:id?",
    component: AddOrder,
    roles: [roleTags.role_admin, roleTags.role_staff],
  },
  {
    path: "/order/edit-order/:id",
    component: EditOrder,
    roles: [roleTags.role_admin, roleTags.role_staff],
  },
  {
    path: "/customer/add-customer",
    component: AddCustomer,
    roles: [roleTags.role_admin],
  },
  {
    path: "/customer/all-customer",
    component: AllCustomer,
    roles: [roleTags.role_admin],
  },
  {
    path: "/customer/edit-customer/:id",
    component: EditCustomer,
    roles: [roleTags.role_admin],
  },
  {
    path: "/branch/add-branch",
    component: AddBranch,
    roles: [roleTags.role_admin],
  },
  {
    path: "/branch/all-branch",
    component: AllBranch,
    roles: [roleTags.role_admin],
  },
  {
    path: "/branch/edit-branch/:id",
    component: EditBranch,
    roles: [roleTags.role_admin],
  },
  {
    path: "/purchase/add-purchase/:id?",
    component: AddPurchase,
    roles: [roleTags.role_admin, roleTags.role_staff],
  },
  {
    path: "/purchase/all-purchase",
    component: AllPurchase,
    roles: [roleTags.role_admin, roleTags.role_staff],
  },
  {
    path: "/supplier/add-supplier",
    component: AddSupplier,
    roles: [roleTags.role_admin],
  },
  {
    path: "/supplier/all-supplier",
    component: AllSupplier,
    roles: [roleTags.role_admin],
  },
  {
    path: "/supplier/edit-supplier/:id",
    component: EditSupplier,
    roles: [roleTags.role_admin],
  },

  {
    path: "/user/all-user",
    component: AllUser,
    roles: [roleTags.role_admin],
  },
  {
    path: "/user/edit-user/:id?",
    component: EditUser,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/permission/all-permission",
    component: AllPermission,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/permission/edit-permission/:id?",
    component: AddPermission,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/permission/add-permission/:id?",
    component: AddPermission,
    roles: [roleTags.role_amdin],
  },
  {
    path: "/menus/all-menu/",
    component: AllMenu,
    roles: [roleTags.role_amdin],
  },
 
  {
    path: "/map",
    component: MapLayer,
    roles: [roleTags.role_admin],
  },

  {
    path: "*",
    component: Page404,
    roles: [roleTags.role_admin, roleTags.role_staff],
  },
];

export default routes;
