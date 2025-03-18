import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
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
    borderBottom: "1 solid #ccc",
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1 solid #ccc",
    paddingVertical: 5,
  },
  column: { flex: 1, textAlign: "center" },
  totalSection: {
    marginTop: 10,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: { textAlign: "center", marginTop: 20, fontSize: 10, color: "gray" },
  signature: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 12,
    fontStyle: "italic",
  },
});

// Component hóa đơn PDF
const InvoiceDocument = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>
        {invoiceData.type === "import"
          ? "HÓA ĐƠN NHẬP HÀNG"
          : "HÓA ĐƠN XUẤT HÀNG"}
      </Text>

      {/* Thông tin hóa đơn */}
      <View style={styles.section}>
        <Text>Số hóa đơn: {invoiceData.invoiceNumber}</Text>
        <Text>Ngày lập: {invoiceData.date}</Text>
        <Text>
          {invoiceData.type === "import" ? "Nhà cung cấp" : "Khách hàng"}:{" "}
          {invoiceData.partner}
        </Text>
      </View>

      {/* Danh sách sản phẩm */}
      <View style={styles.section}>
        <View
          style={[styles.row, { fontWeight: "bold", backgroundColor: "#eee" }]}
        >
          <Text style={styles.column}>Tên sản phẩm</Text>
          <Text style={styles.column}>Số lượng</Text>
          <Text style={styles.column}>Đơn giá (VND)</Text>
          <Text style={styles.column}>Thành tiền (VND)</Text>
        </View>

        {invoiceData.items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.column}>{item.name}</Text>
            <Text style={styles.column}>{item.quantity}</Text>
            <Text style={styles.column}>{item.price.toLocaleString()}</Text>
            <Text style={styles.column}>
              {(item.quantity * item.price).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Tổng tiền */}
      <Text style={styles.totalSection}>
        Tổng tiền: {invoiceData.total.toLocaleString()} VND
      </Text>

      {/* Chữ ký */}
      <Text style={styles.signature}>Ký tên: ............................</Text>

      {/* Footer */}
      <Text style={styles.footer}>
        Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
      </Text>
    </Page>
  </Document>
);

// Hàm tạo và mở PDF
const generateAndOpenPDF = async (invoiceData) => {
  const blob = await pdf(
    <InvoiceDocument invoiceData={invoiceData} />
  ).toBlob();
  const pdfUrl = URL.createObjectURL(blob);
  window.open(pdfUrl, "_blank"); // Mở PDF trong tab mới
};

// Component hiển thị nút tải PDF
const Invoice = ({ invoiceData }) => (
  <div className="text-right">
    <Button
      variant="contained"
      color="primary"
      onClick={() => generateAndOpenPDF(invoiceData)}
    >
      Tải hóa đơn PDF
    </Button>
  </div>
);

export default Invoice;
