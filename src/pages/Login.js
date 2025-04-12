import React, { useState } from "react";
import { Link } from "react-router-dom";

import ImageLight from "../assets/img/login-office.jpeg";
import ImageDark from "../assets/img/login-office-dark.jpeg";
import { Label, Input, Button, HelperText } from "@windmill/react-ui";
import { authAPI } from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import { showErrorToast, showSuccessToast } from "../components/Toast";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

function Login() {
  const history = useHistory();
  const { login, fetchMenu } = useAuth();

  // Validate form
  const schema = yup.object().shape({
    username: yup
      .string()
      .required("Username is required!")
      .min(6, "Username must be at least 6 characters!"),
    password: yup.string().required("Password is required!"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmitForm = async (data) => {
    try {
      const res = await authAPI.login(data);

      if (res.status === 200 && res.data.code === 200) {
        const accessToken = res.data?.data?.accessToken;
        const { exp } = jwtDecode(accessToken); // Kiểm tra lỗi
        const tokenStorage = JSON.stringify({
          ...res.data?.data,
          expiration: Date.now() + exp,
        });
        login(tokenStorage);
        history.push("/app/dashboard");
        showSuccessToast("Login successfully");
        fetchMenu();
      }

      if (res.data.code !== 200) {
        throw new Error(res.data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col overflow-y-auto md:flex-row">
          <div className="h-32 md:h-auto md:w-1/2">
            <img
              aria-hidden="true"
              className="object-cover w-full h-full dark:hidden"
              src={ImageLight}
              alt="Office"
            />
            <img
              aria-hidden="true"
              className="hidden object-cover w-full h-full dark:block"
              src={ImageDark}
              alt="Office"
            />
          </div>
          <main className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
            <div className="w-full">
              <form onSubmit={handleSubmit(onSubmitForm)}>
                <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Login
                </h1>
                <Label>
                  <span>Username</span>
                  <Input
                    {...register("username")}
                    className="mt-1"
                    type="text"
                    name="username"
                    autoComplete="off"
                    valid={!errors?.username}
                  />
                  <HelperText valid={!errors?.username}>
                    {errors?.username?.message}
                  </HelperText>
                </Label>

                <Label className="mt-4">
                  <span>Password</span>
                  <Input
                    className="mt-1"
                    type="password"
                    {...register("password")}
                    placeholder="***************"
                    name="password"
                    autoComplete="off"
                    valid={!errors?.password}
                  />
                  <HelperText valid={!errors?.password}>
                    {errors?.password?.message}
                  </HelperText>
                </Label>
                <Button className="mt-4 w-full" type="submit">
                  Log in
                </Button>
              </form>

              <hr className="my-8" />

              <p className="mt-4">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/forgot-password"
                >
                  Forgot your password?
                </Link>
              </p>
              <p className="mt-1">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/create-account"
                >
                  Create account
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Login;
