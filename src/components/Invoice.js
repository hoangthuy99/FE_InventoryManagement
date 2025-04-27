import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  Image,
} from "@react-pdf/renderer";
import { Button } from "@mui/material";

// 1. Đăng ký font hỗ trợ Tiếng Việt (Roboto)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "/font/static/Roboto-Regular.ttf",
      fontWeight: "400",
    }, // Regular
    {
      src: "/font/static/Roboto-Italic.ttf",
      fontWeight: "400",
      fontStyle: "italic",
    }, // Italic
    {
      src: "/font/static/Roboto-Bold.ttf",
      fontWeight: "700",
    }, // Bold
    {
      src: "/font/static/Roboto-BoldItalic.ttf",
      fontWeight: "700",
      fontStyle: "italic",
    }, // Bold Italic
  ],
});

// Định nghĩa kiểu dáng PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: "Roboto" },
  header: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flex: 1,
    verticalAlign: "sub",
    textAlign: "center",
    fontSize: 11,
    padding: "5px 0px",
  },
  border1: {
    border: "1 solid #ccc",
  },
  totalSection: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: { textAlign: "center", marginTop: 20, fontSize: 10, color: "gray" },
  signature: {
    marginTop: 20,
    fontSize: 12,
    fontStyle: "italic",
  },
});

// Component hóa đơn PDF
const InvoiceGDR = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Chi nhánh: {invoiceData?.branchName}</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>{invoiceData?.title}</Text>

      {/* Thông tin hóa đơn */}
      <View style={styles.section}>
        <Text>Số hóa đơn: {invoiceData?.invoiceNumber}</Text>
        <Text>Ngày lập: {invoiceData?.date}</Text>
        <Text>Nhà cung cấp: {invoiceData?.supplierName}</Text>
        <Text>Địa chỉ nhà cung cấp: {invoiceData?.supplierAddress}</Text>
      </View>

      {/* Danh sách sản phẩm */}
      <View>
        <View
          style={[styles.row, { fontWeight: "bold", backgroundColor: "#eee" }]}
        >
          <Text style={[styles.column, styles.border1]}>STT</Text>
          <Text style={[styles.column, styles.border1]}>Tên sản phẩm</Text>
          <Text style={[styles.column, styles.border1]}>Đơn vị tính</Text>
          <Text style={[styles.column, styles.border1]}>Số lượng</Text>
          <Text style={[styles.column, styles.border1]}>Đơn giá (VND)</Text>
          <Text style={[styles.column, styles.border1]}>Thành tiền (VND)</Text>
        </View>

        {invoiceData?.items?.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.column, styles.border1]}>{index + 1}</Text>
            <Text style={[styles.column, styles.border1]}>{item.name}</Text>
            <Text style={[styles.column, styles.border1]}>{item.unit}</Text>
            <Text style={[styles.column, styles.border1]}>{item.quantity}</Text>
            <Text style={[styles.column, styles.border1]}>
              {item.price.toLocaleString()}
            </Text>
            <Text style={[styles.column, styles.border1]}>
              {(item.quantity * item.price).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Tổng tiền */}
      <Text style={styles.totalSection}>
        Tổng tiền thanh toán: {invoiceData?.total.toLocaleString()} VND
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 30,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.signature}>
            Người lập phiếu: ..................................................
          </Text>
          <Text style={styles.signature}>
            Thủ kho: ..........................................................
          </Text>
          <Text style={styles.signature}>
            Nhà cung cấp: .....................................................
          </Text>
        </View>

        <Image style={{ width: 100, height: 100 }} src="/images/qrcode.png" />
      </View>
    </Page>
  </Document>
);

const InvoiceGDI = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Chi nhánh: {invoiceData?.branchName}</Text>
      </View>

      {/* Header */}
      <Text style={styles.header}>{invoiceData?.title}</Text>

      {/* Thông tin hóa đơn */}
      <View style={styles.section}>
        <Text>Số hóa đơn: {invoiceData?.invoiceNumber}</Text>
        <Text>Ngày lập: {invoiceData?.date}</Text>
        <Text>Tên khách hàng: {invoiceData?.customerName}</Text>
        <Text>Địa chỉ khách hàng: {invoiceData?.customerAddress}</Text>
      </View>

      {/* Danh sách sản phẩm */}
      <View>
        <View
          style={[styles.row, { fontWeight: "bold", backgroundColor: "#eee" }]}
        >
          <Text style={[styles.column, styles.border1]}>STT</Text>
          <Text style={[styles.column, styles.border1]}>Tên sản phẩm</Text>
          <Text style={[styles.column, styles.border1]}>Đơn vị tính</Text>
          <Text style={[styles.column, styles.border1]}>Số lượng</Text>
          <Text style={[styles.column, styles.border1]}>Đơn giá (VND)</Text>
          <Text style={[styles.column, styles.border1]}>Thành tiền (VND)</Text>
        </View>

        {invoiceData?.items?.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={[styles.column, styles.border1]}>{index + 1}</Text>
            <Text style={[styles.column, styles.border1]}>{item.name}</Text>
            <Text style={[styles.column, styles.border1]}>{item.unit}</Text>
            <Text style={[styles.column, styles.border1]}>{item.quantity}</Text>
            <Text style={[styles.column, styles.border1]}>
              {item.price.toLocaleString()}
            </Text>
            <Text style={[styles.column, styles.border1]}>
              {(item.quantity * item.price).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Tổng tiền */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Bên trái: Chữ ký */}
        <View>
          <Text style={styles.totalSection}>
            Tổng tiền thanh toán: {invoiceData?.total.toLocaleString()} VND
          </Text>

          <Text style={styles.signature}>
            Người lập phiếu: ............................
          </Text>
          <Text style={styles.signature}>
            Thủ kho: ............................
          </Text>
          <Text style={styles.signature}>
            Khách hàng: ............................
          </Text>
        </View>

        {/* Bên phải: QR Code */}
        <Image style={{ width: 200 }} src="/images/qrcode.png" />
      </View>
    </Page>
  </Document>
);

// Hàm tạo và mở PDF
const generateAndOpenPDF = async (invoiceData, type) => {
  if (invoiceData) {
    const blob = await pdf(
      type === "gdr" ? (
        <InvoiceGDR invoiceData={invoiceData} />
      ) : (
        <InvoiceGDI invoiceData={invoiceData} />
      )
    ).toBlob();
    const pdfUrl = URL.createObjectURL(blob);
    window.open(pdfUrl, "_blank"); // Mở PDF trong tab mới
  }
};

// Component hiển thị nút tải PDF
const Invoice = ({ invoiceData, type }) => (
  <div className="text-right">
    <Button
      variant="contained"
      color="secondary"
      onClick={() => generateAndOpenPDF(invoiceData, type)}
    >
      In hóa đơn
    </Button>
  </div>
);

export default Invoice;
