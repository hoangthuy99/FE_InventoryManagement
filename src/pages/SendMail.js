import React, { useState, useEffect } from 'react'; // Đảm bảo import useState
import { useLocation } from "react-router-dom";
import { Button, Input, Label, HelperText, Textarea, Select } from "@windmill/react-ui";
import { showErrorToast, showSuccessToast } from "../components/Toast";
import { supplierAPI, customerAPI } from "../api/api";

function SendMail() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const passedEmail = queryParams.get("email");
  const passedType = queryParams.get("emailType");
  const passedId = queryParams.get("id");

  const [emailAddress, setEmailAddress] = useState(passedEmail || "");
  const [emailType, setEmailType] = useState(passedType || "supplier");
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!emailAddress || !/\S+@\S+\.\S+/.test(emailAddress)) {
      showErrorToast("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    if (!mailSubject.trim() || !mailMessage.trim()) {
      showErrorToast("Vui lòng nhập tiêu đề và nội dung email!");
      return;
    }

    setIsLoading(true);
    try {
      if (emailType === "supplier") {
        await supplierAPI.sendMailToSupplier({
          email: emailAddress,
          subject: mailSubject,
          message: mailMessage,
        });
      } else if (emailType === "customer") {
        await customerAPI.sendMailToCustomer({
          email: emailAddress,
          subject: mailSubject,
          message: mailMessage,
        });
      }

      showSuccessToast("Gửi email thành công!");

      // Reset nội dung email
      setMailSubject("");
      setMailMessage("");
    } catch (error) {
      showErrorToast("Gửi email thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 py-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-semibold">Gửi Email</h2>

      <Label className="mt-4">
        <span>Đối tượng nhận</span>
        <Select
          className="mt-1"
          value={emailType}
          onChange={(e) => setEmailType(e.target.value)}
        >
          <option value="supplier">Nhà cung cấp</option>
          <option value="customer">Khách hàng</option>
        </Select>
      </Label>

      <Label className="mt-4">
        <span>Địa chỉ Email</span>
        <Input
          className="mt-1"
          type="email"
          placeholder="example@email.com"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
        {emailAddress && !/\S+@\S+\.\S+/.test(emailAddress) && (
          <HelperText valid={false}>Email không hợp lệ</HelperText>
        )}
      </Label>

      <Label className="mt-4">
        <span>Tiêu đề</span>
        <Input
          className="mt-1"
          placeholder="Nhập tiêu đề"
          value={mailSubject}
          onChange={(e) => setMailSubject(e.target.value)}
        />
      </Label>

      <Label className="mt-4">
        <span>Nội dung</span>
        <Textarea
          className="mt-1"
          rows={5}
          placeholder="Nhập nội dung email"
          value={mailMessage}
          onChange={(e) => setMailMessage(e.target.value)}
        />
      </Label>

      <Button
        className="w-full mt-6"
        onClick={handleSend}
        disabled={isLoading}
      >
        {isLoading ? "Đang gửi..." : "Gửi Email"}
      </Button>
    </div>
  );
}

export default SendMail;
