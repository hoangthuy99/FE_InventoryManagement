import { lazy } from 'react'


// use lazy for better code splitting, a.k.a. load faster
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Category = lazy(() => import('../pages/category/AllCategory'))
const Product = lazy(() => import('../pages/product/Product'))
const History = lazy(() => import('../pages/History'))
const Buttons = lazy(() => import('../pages/Buttons'))
const Modals = lazy(() => import('../pages/Modals'))
const Tables = lazy(() => import('../pages/Tables'))
const Page404 = lazy(() => import('../pages/404'))


/**
*Đây là các tuyến nội bộ!
* Chúng sẽ được hiển thị bên trong ứng dụng, sử dụng `containers/Layout` mặc định.
* Nếu bạn muốn thêm tuyến đến, chẳng hạn như trang đích, bạn nên thêm
* tuyến đó vào bộ định tuyến của `Ứng dụng`, giống hệt như `Đăng nhập`, `CreateAccount` và các trang khác
* được định tuyến.
*
* Nếu bạn đang tìm kiếm các liên kết được hiển thị trong SidebarContent, hãy truy cập
* `routes/sidebar.js`
 */
const routes = [
  {
    path: '/dashboard', // the url
    component: Dashboard, // view rendered
  },
  {
    path: '/category/all-category',
    component:Category,
  },
  {
    path: '/product',
    component: Product,
  },
  {
    path: '/history',
    component: History,
  },
  {
    path: '/buttons',
    component: Buttons,
  },
  {
    path: '/modals',
    component: Modals,
  },
  {
    path: '/tables',
    component: Tables,
  },
  {
    path: '/404',
    component: Page404,
  },
  
]

export default routes
