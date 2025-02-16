import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import AccessibleNavigationAnnouncer from './components/AccessibleNavigationAnnouncer'
import React, { lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

function App() {
  return (
    <Router>
      <AccessibleNavigationAnnouncer />
      <ToastContainer position="top-right" autoClose={3000} />
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/create-account" component={CreateAccount} />
        <Route exact path="/forgot-password" component={ForgotPassword} />

        {/* Place new routes over this */}
        <Route path="/app" component={Layout} />

        {/* Chuyển hướng mặc định */}
        <Redirect exact from="/" to="/login" />
      </Switch>
    </Router>
  )
}

export default App
