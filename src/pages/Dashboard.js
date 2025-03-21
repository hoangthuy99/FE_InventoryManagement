import React, { useState, useEffect } from "react";

import CTA from "../components/CTA";
import InfoCard from "../components/Cards/InfoCard";
import ChartCard from "../components/Chart/ChartCard";
import { Doughnut, Line } from "react-chartjs-2";
import ChartLegend from "../components/Chart/ChartLegend";
import PageTitle from "../components/Typography/PageTitle";
import { ChatIcon, CartIcon, MoneyIcon, PeopleIcon } from "../icons";
import RoundIcon from "../components/RoundIcon";
import response from "../utils/demo/tableData";
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
} from "@windmill/react-ui";

import {
  doughnutOptions,
  lineOptions,
  doughnutLegends,
  lineLegends,
} from "../utils/demo/chartsData";
import { dashboardAPI, orderAPI } from "../api/api";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function Dashboard() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalBussiness, setTotalBussiness] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalBranchs: 0,
    lowStockProducts: [],
  });
  const [totalOrderStatus, setTotalOrderStatus] = useState({
    totalPending: 0,
    totalCancel: 0,
    totalDone: 0,
  });
  const [orderStatusChart, setOrderStatusChart] = useState({
    data: {
      datasets: [
        {
          data: [33, 33, 33],
          backgroundColor: ["#0694a2", "#1c64f2", "#7e3af2"],
          label: "Dataset 1",
        },
      ],
      labels: ["Pending", "Cancel", "Done"],
    },
    options: {
      responsive: true,
      cutoutPercentage: 80,
    },
    legend: {
      display: false,
    },
  });
  const history = useHistory();
  const [orders, setOrders] = useState([]);

  const fetchTotalBussiness = async () => {
    try {
      const response = await dashboardAPI.getTotalBussiness();
      const data = response.data;

      if (data.code === 200) {
        setTotalBussiness({
          totalProducts: data?.data.totalProducts,
          totalRevenue: data?.data.totalRevenue,
          totalBranchs: data?.data.totalBranchs,
          lowStockProducts: data?.data.lowStockProducts,
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  // fetch total order status
  const fetchTotalStatus = async () => {
    try {
      const response = await dashboardAPI.getTotalOrderStatus();
      const data = response.data;

      if (data.code === 200) {
        setTotalOrderStatus({
          totalPending: data?.data.totalOrderPending,
          totalCancel: data?.data.totalOrderCancel,
          totalDone: data?.data.totalOrderDone,
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  // fetch all orders
  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAllPaginated(0, 5);
      console.log("Dữ liệu API trả về:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data?.filter((o) => o.status === "PENDING"));
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setOrders([]);
    }
  };

  // pagination setup
  const resultsPerPage = 10;
  const totalResults = response.length;

  // pagination change control
  function onPageChange(p) {
    setPage(p);
  }

  // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    setData(response.slice((page - 1) * resultsPerPage, page * resultsPerPage));
    fetchTotalBussiness();
    fetchOrders();
    fetchTotalStatus();
  }, [page]);

  useEffect(() => {
    if (totalOrderStatus) {
      setOrderStatusChart({
        ...orderStatusChart,
        data: {
          datasets: [
            {
              data: [
                totalOrderStatus.totalPending || 0,
                totalOrderStatus.totalCancel || 0,
                totalOrderStatus.totalDone || 0,
              ],
              backgroundColor: ["#0694a2", "#1c64f2", "#7e3af2"],
              label: "Total",
            },
          ],
          labels: ["Pending", "Cancel", "Done"],
        },
      });
    }
  }, [totalOrderStatus]);

  return (
    <>
      <PageTitle>Dashboard</PageTitle>

      <CTA />

      {/* <!-- Cards --> */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="Total products" value={totalBussiness.totalProducts}>
          <RoundIcon
            icon={PeopleIcon}
            iconColorClass="text-orange-500 dark:text-orange-100"
            bgColorClass="bg-orange-100 dark:bg-orange-500"
            className="mr-4 cursor-pointer hover:text-orange-400"
          />
        </InfoCard>

        <InfoCard
          title="Total revenue"
          value={totalBussiness.totalRevenue.toLocaleString()}
        >
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard title="Total branchs" value={totalBussiness.totalBranchs}>
          <RoundIcon
            icon={CartIcon}
            iconColorClass="text-blue-500 dark:text-blue-100"
            bgColorClass="bg-blue-100 dark:bg-blue-500"
            className="mr-4"
          />
        </InfoCard>

        <InfoCard
          title="Low of stock products"
          value={totalBussiness.lowStockProducts.length}
        >
          <RoundIcon
            icon={ChatIcon}
            iconColorClass="text-teal-500 dark:text-teal-100"
            bgColorClass="bg-teal-100 dark:bg-teal-500"
            className="mr-4"
          />
        </InfoCard>
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>Mã đơn hàng</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Chi nhánh</TableCell>
              <TableCell>Ngày dự kiến xuất kho</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {orders.map((o, i) => (
              <TableRow key={i}>
                <TableCell>
                  <p
                    onClick={() => history.push("/app/order/all-orders")}
                    className="font-semibold  hover:underline cursor-pointer"
                  >
                    {o.orderCode}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{o.customer.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{o.branch.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(o.plannedExportDate).toLocaleString("vi-VN") ||
                      "N/A"}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {o.totalPrice.toLocaleString() + " VNĐ"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{o.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter>
          {/* <Pagination
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
            label="Table navigation"
            onChange={onPageChange}
          /> */}
          <div
            onClick={() => history.push("/app/order/all-orders")}
            className="text-right text-blue-500 hover:text-blue-600 cursor-pointer"
          >
            View more --&gt;
          </div>
        </TableFooter>
      </TableContainer>

      <PageTitle>Charts</PageTitle>``
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <ChartCard title="Order status">
          <Doughnut {...orderStatusChart} />
        </ChartCard>

        <ChartCard title="Traffic">
          <Line {...lineOptions} />
          <ChartLegend legends={lineLegends} />
        </ChartCard>
      </div>
    </>
  );
}

export default Dashboard;
