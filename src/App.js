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
  ShippingLoginSuccessRoute,
} from "./context/AuthContext";
import Tracking from "./pages/shipping/Tracking";
import ShipperLogin from "./pages/shipping/ShipperLogin";

const Layout = lazy(() => import("./containers/Layout"));
const Login = lazy(() => import("./pages/Login"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

function App() {
  return (
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
          {/* Place new routes over this */}
          <Route
            path="/app"
            render={(props) => (
              <ProtectedRoute>
                <Layout {...props} />
              </ProtectedRoute>
            )}
          />
          {/* Chuyển hướng mặc định */}
          <Route
            exact
            path="/"
            render={() => (
              <LoginSuccessRoute>
                <Redirect to="/login" />
              </LoginSuccessRoute>
            )}
          />

          {/* Place new routes over this */}
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
  );
}

export default App;
