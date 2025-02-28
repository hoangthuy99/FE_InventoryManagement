import { lazy } from "react";
import AddPurchase from "../pages/purchaseOrder/AddPurchase";
import AllPurchase from "../pages/purchaseOrder/AllPurchase";

// Import các component
const Dashboard = lazy(() => import("../pages/Dashboard"));
const AllCategory = lazy(() => import("../pages/category/AllCategory"));
const AddCategory = lazy(() => import("../pages/category/AddCategory"));
const EditCategory = lazy(() => import("../pages/category/Editcategory"));
const AddProductInfo = lazy(() => import("../pages/product/AddProductInfo"));
const AllProduct = lazy(() => import("../pages/product/AllProduct"));
const EditProduct = lazy(() => import("../pages/product/EditProduct"));
const History = lazy(() => import("../pages/History"));
const Buttons = lazy(() => import("../pages/Buttons"));
const Modals = lazy(() => import("../pages/Modals"));
const Tables = lazy(() => import("../pages/Tables"));
const Page404 = lazy(() => import("../pages/404"));
const Cards = lazy(() => import("../pages/Cards"));
const Forms = lazy(() => import("../pages/Forms"));

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
    path: "/purchase/all-purchase",
    component: AllPurchase,
  },
  {
    path: "/purchase/add-purchase/:id?",
    component: AddPurchase,
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
