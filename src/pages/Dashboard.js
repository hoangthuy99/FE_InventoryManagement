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
} from "@windmill/react-ui";

import { dashboardAPI, orderAPI } from "../api/api";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { lineLegends } from "../utils/demo/chartsData";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const revenueFilters = [
  {
    key: 1,
    label: "Month",
  },
  {
    key: 2,
    label: "Quarter",
  },
  {
    key: 3,
    label: "Year",
  },
];

function Dashboard() {
  const [data, setData] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [lineChartData, setLineChartData] = useState({
    data: {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
        {
          label: "Import Cost",
          backgroundColor: "#0694a2",
          borderColor: "#0694a2",
          data: [43, 48, 40, 54, 67, 73, 70],
          fill: false,
        },
        {
          label: "Revenue",
          fill: false,
          backgroundColor: "#7e3af2",
          borderColor: "#7e3af2",
          data: [24, 50, 64, 74, 52, 51, 65],
        },
      ],
    },
    options: {
      responsive: true,
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
      scales: {
        x: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Month",
          },
        },
        y: {
          display: true,
          scaleLabel: {
            display: true,
            labelString: "Value",
          },
        },
      },
    },
    legend: {
      display: false,
    },
  });
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

  // fetch total bussiness statistics
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
        setOrderStatusChart({
          ...orderStatusChart,
          data: {
            datasets: [
              {
                data: [
                  data?.data.totalOrderPending || 0,
                  data?.data.totalOrderCancel || 0,
                  data?.data.totalOrderDone || 0,
                ],
                backgroundColor: ["#0694a2", "#1c64f2", "#7e3af2"],
                label: "Total",
              },
            ],
            labels: ["Pending", "Cancel", "Done"],
          },
        });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API danh mục:", error);
    }
  };

  // fetch total revenue
  const fetchTotalRevenue = async () => {
    try {
      const response = await dashboardAPI.getTotalRevenue(filterType);
      const data = response.data;

      if (data.code === 200) {
        const revenueData = data?.data.reduce(
          (prev, val) => {
            prev["labels"].push(val.filterType);
            prev["importCost"].push(val.totalImportCost);
            prev["revenue"].push(val.totalRevenue);
            return prev;
          },
          {
            labels: [],
            importCost: [],
            revenue: [],
          }
        );

        const chartData = {
          labels: revenueData.labels,
          datasets: [
            {
              label: "Import Cost",
              backgroundColor: "#0694a2",
              borderColor: "#0694a2",
              data: revenueData.importCost,
              fill: false,
            },
            {
              label: "Revenue",
              fill: false,
              backgroundColor: "#7e3af2",
              borderColor: "#7e3af2",
              data: revenueData.revenue,
            },
          ],
        };
        setLineChartData({
          ...lineChartData,
          data: chartData,
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
        setOrders(response.data?.filter((o) => o.status === 1));
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setOrders([]);
    }
  };

  // Change revenue filter
  const changeRevenueFilter = async (key) => {
    setFilterType(key);
  };

  // Get total revenue every time the filter type be changed
  useEffect(() => {
    fetchTotalRevenue();
  }, [filterType]);

  // on page change, load new sliced data
  // here you would make another server request for new data
  useEffect(() => {
    fetchTotalBussiness();
    fetchOrders();
    fetchTotalStatus();
  }, []);

  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      {/* <!-- Cards --> */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <Box
          className="cursor-pointer"
          onClick={() => history.push("/app/product/all-product")}
        >
          <InfoCard title="Total products" value={totalBussiness.totalProducts}>
            <RoundIcon
              icon={PeopleIcon}
              iconColorClass="text-orange-500 dark:text-orange-100"
              bgColorClass="bg-orange-100 dark:bg-orange-500"
              className="mr-4"
            />
          </InfoCard>
        </Box>

        <InfoCard
          title="Total revenue"
          value={totalBussiness?.totalRevenue?.toLocaleString() || 0}
        >
          <RoundIcon
            icon={MoneyIcon}
            iconColorClass="text-green-500 dark:text-green-100"
            bgColorClass="bg-green-100 dark:bg-green-500"
            className="mr-4"
          />
        </InfoCard>

        <Box
          className="cursor-pointer"
          onClick={() => history.push("/app/branch/all-branch")}
        >
          <InfoCard title="Total branchs" value={totalBussiness.totalBranchs}>
            <RoundIcon
              icon={CartIcon}
              iconColorClass="text-blue-500 dark:text-blue-100"
              bgColorClass="bg-blue-100 dark:bg-blue-500"
              className="mr-4"
            />
          </InfoCard>
        </Box>

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
                    onClick={() => history.push(`/app/order/add-order/${o.id}`)}
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

        <ChartCard title="Revenue">
          <FormControl>
            <InputLabel id="revenueFilter">Filter</InputLabel>
            <Select
              labelId="revenueFilter"
              value={filterType}
              label="Filter"
              onChange={(e) => changeRevenueFilter(e.target.value)}
            >
              {revenueFilters.map((f) => {
                return <MenuItem value={f.key}>{f.label}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <Line {...lineChartData} />
          <ChartLegend legends={lineLegends} />
        </ChartCard>
      </div>
    </>
  );
}

export default Dashboard;
