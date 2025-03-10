
import { lazy } from "react";
import AddPurchase from "../pages/purchaseOrder/AddPurchase";
import AllPurchase from "../pages/purchaseOrder/AllPurchase";
import MapLayer from "../pages/map";

// Import các component 
const Dashboard = lazy(() => import('../pages/Dashboard'))
const AllCategory = lazy(() => import('../pages/category/AllCategory'))
const AddCategory = lazy(() => import('../pages/category/AddCategory'))
const EditCategory = lazy(() => import('../pages/category/Editcategory'))
const AddProductInfo = lazy(() => import('../pages/product/AddProductInfo'))
const AllProduct = lazy(() => import('../pages/product/AllProduct'))
const EditProduct = lazy(() => import('../pages/product/EditProduct'))
const AddOrder = lazy(() => import('../pages/order/AddOrder'))
const AllOrders = lazy(() => import('../pages/order/AllOrders'))
const AddCustomer = lazy(() => import('../pages/customer/AddCustomer'))
const AllCustomer = lazy(() => import('../pages/customer/AllCustomer'))
const EditCustomer = lazy(() => import('../pages/customer/EditCustomer'))
const AddBranch = lazy(() => import('../pages/branch/AddBranch'))
const AllBranch = lazy(() => import('../pages/branch/AllBranch')) 
const EditBranch = lazy(() => import('../pages/branch/EditBranch'))
const AddSupplier = lazy(() => import('../pages/supplier/AddSupplier'))
const AllSupplier = lazy(() => import('../pages/supplier/AllSupplier'))
const EditSupplier = lazy(() => import('../pages/supplier/EditSupplier'))
const Buttons = lazy(() => import('../pages/Buttons'))
const Modals = lazy(() => import('../pages/Modals'))
const Tables = lazy(() => import('../pages/Tables'))
const Page404 = lazy(() => import('../pages/404'))
const Cards = lazy(() => import('../pages/Cards'))
const Forms = lazy(() => import('../pages/Forms'))

const routes = [
  {
    path: "/dashboard", // the url
    component: Dashboard, // view rendered
  },
  {
    path: "/category/all-category",
    component: AllCategory,
  },
  {
    path: "/category/add-category",
    component: AddCategory,
  },

  {
    path: "/category/edit-category/:id",
    component: EditCategory,
  },

  {
    path: "/product/add-product",
    component: AddProductInfo,
  },
  {
    path: "/product/all-product",
    component: AllProduct,
  },
  {
    path: "/product/edit-product/:id",
    component: EditProduct,
  },
  {
    path: "/order/all-orders",
    component: AllOrders,
  },
  
  {
    path: "/order/add-order",
    component: AddOrder,
  },

  {
    path: "/customer/add-customer",
    component: AddCustomer,
  },
  {
    path: "/customer/all-customer",
    component: AllCustomer,
  },
  {
    path: "/customer/edit-customer/:id",
    component: EditCustomer,
  },
  {
    path: "/branch/add-branch",
    component: AddBranch,
  },
  {
    path: "/branch/all-branch",
    component: AllBranch,
  },
  {
    path: "/branch/edit-branch/:id",
    component: EditBranch,
   
  },
  {
    path: "/purchase/add-purchase/:id?",
    component: AddPurchase,
  },
  {
    path: "/purchase/all-purchase",
    component: AllPurchase,
  },
  {
    path: '/supplier/add-supplier',
    component: AddSupplier,
  },
   {
    path: '/supplier/all-supplier',
    component: AllSupplier,
  },
  {
    path: '/supplier/edit-supplier/:id',
    component: EditSupplier,
   
  },
  {
    path: "/buttons",
    path: "/purchase/all-purchase",
    component: AllPurchase,
  },
  {
    path: "/purchase/add-purchase/:id?",
    component: AddPurchase,
  },
  {
    path: "/map",
    component: MapLayer,
  },
  {
    path: "/history",
    component: History,
  },
  {
    path: "/buttons",
    component: Buttons,
  },
  {
    path: "/modals",
    component: Modals,
  },
  {
    path: "/tables",
    component: Tables,
  },
  {
    path: "/cards",
    component: Cards,
  },
  {
    path: "/forms",
    component: Forms,
  },
  {
    path: "*",
    component: Page404,
  },
];

export default routes;

