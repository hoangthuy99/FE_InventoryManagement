const routes = [
  {
    path: "/app/dashboard", // the url
    icon: "HomeIcon",
    name: "Dashboard", // name that appear in Sidebar
  },
  {
    icon: "ModalsIcon",
    name: "Category",
    routes: [
      { path: "/app/category/all-category", name: "All Category" },
      { path: "/app/category/add-category", name: "Add Category" },
    ],
  },
  {
    icon: "ProductIcon",
    name: "Product",
    routes: [
      { path: "/app/product/all-product", name: "All Product" },
      { path: "/app/product/add-product", name: "Add Product" },
    ],
  },
  {
    icon: "ReceiptIcon",
    name: "Good Receipt",
    routes: [
      { path: "/app/purchase/all-purchase", name: "All Purchase" },
      { path: "/app/purchase/add-purchase", name: "Add Purchase" },
    ],
  },
  {
    icon: "IssueIcon",
    name: "Good Issue",
    routes: [
      { path: "/app/order/all-orders", name: "All Orders" },
      { path: "/app/order/add-order", name: "Add Order" },
    ],
  },
  {
    icon: "CustomerIcon",
    name: "Customer",
    routes: [
      { path: "/app/customer/all-customer", name: "All Customer" },
      { path: "/app/customer/add-customer", name: "Add Customer" },
    ],
  },
  {
    icon: "BranchIcon",
    name: "Branch",
    routes: [
      { path: "/app/branch/all-branch", name: "All Branch" },
      { path: "/app/branch/add-branch", name: "Add Branch" },
    ],
  },
  {
    icon: "MapIcon",
    name: "Map",
    routes: [{ path: "/app/map", name: "Area-Map" }],
  },
  {
    icon: "SupplierIcon",
    name: "Supplier",
    routes: [
      { path: "/app/supplier/all-supplier", name: "All Supplier" },
      { path: "/app/supplier/add-supplier", name: "Add Supplier" },
    ],
  },
  
  {
    icon: "PagesIcon",
    name: "Account",
    routes: [
      // submenu
      {
        path: "/login",
        name: "Login",
      },
      {
        path: "/create-account",
        name: "Create account",
      },
      {
        path: "/forgot-password",
        name: "Forgot password",
      },
      {
        path: "/app/404",
        name: "404",
      },
      {
        path: "/app/blank",
        name: "Blank",
      },
    ],
  },
];

export default routes;
