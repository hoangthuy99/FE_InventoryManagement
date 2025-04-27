import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import AccessibleNavigationAnnouncer from "./components/AccessibleNavigationAnnouncer";
import React, { lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AuthProvider,
  LoginSuccessRoute,
  ProtectedRoute,
  ProtectedRouteShipping,
  ProtectedRouteProfile,
  ShippingLoginSuccessRoute,
} from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Tracking from "./pages/shipping/Tracking";
import ShipperLogin from "./pages/shipping/ShipperLogin";
import Profile from "./pages/Profile";

const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App() {
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AccessibleNavigationAnnouncer />
          <ToastContainer position="top-right" autoClose={3000} />
          <Switch>
            <Route
              exact
              path="/login"
              render={(props) => (
                <LoginSuccessRoute>
                  <Login {...props} />
                </LoginSuccessRoute>
              )}
            />
            <Route
              exact
              path="/forgot-password"
              render={(props) => (
                <LoginSuccessRoute>
                  <ForgotPassword {...props} />
                </LoginSuccessRoute>
              )}
            />
            <Route
              path="/app"
              render={(props) => (
                <ProtectedRoute>
                  <Layout {...props} />
                </ProtectedRoute>
              )}
            />
            <Route
              exact
              path="/"
              render={() => (
                <LoginSuccessRoute>
                  <Redirect to="/login" />
                </LoginSuccessRoute>
              )}
            />
            <Route path="/app/profile">
              <ProtectedRouteProfile>
                <Profile />
              </ProtectedRouteProfile>
            </Route>
            <Route
              exact
              path="/shipping/login"
              render={(props) => (
                <ShippingLoginSuccessRoute>
                  <ShipperLogin {...props} />
                </ShippingLoginSuccessRoute>
              )}
            />
            <Route
              path="/shipping/tracking"
              render={() => (
                <ProtectedRouteShipping>
                  <Tracking />
                </ProtectedRouteShipping>
              )}
            />
          </Switch>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}


export default App;
