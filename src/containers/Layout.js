import React, { useContext, Suspense, useEffect, lazy } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import routes from "../routes";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Main from "../containers/Main";
import ThemedSuspense from "../components/ThemedSuspense";
import { SidebarContext } from "../context/SidebarContext";
import { SessionProvider } from "next-auth/react";
import { useAuth } from "../context/AuthContext";

const Page404 = lazy(() => import("../pages/404"));
const Page401 = lazy(() => import("../pages/401"));

function Layout({ Component, pageProps }) {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  let location = useLocation();
  const { getTokenInfo } = useAuth();
  const tokenInfo = getTokenInfo();

  useEffect(
    () => {
      closeSidebar();
    },
    [location],
    [closeSidebar]
  );

  return (
    <div
      className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${
        isSidebarOpen && "overflow-hidden"
      }`}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <Header />
        <Main>
          <Suspense fallback={<ThemedSuspense />}>
            <Switch>
              {routes.map((route, i) => {
                console.log(route.roles);
                
                return route.component &&
                  route.roles?.includes(...tokenInfo.roles) ? (
                  <Route
                    key={i}
                    exact={true}
                    path={`/app${route.path}`}
                    render={(props) => (
                      <route.component {...pageProps} {...props} />
                    )}
                  />
                ) : (
                  <Route component={Page401} />
                );
              })}
              <Redirect exact from="/app" to="/app/dashboard" />
              <Route component={Page404} />
            </Switch>
          </Suspense>
        </Main>
      </div>
    </div>
  );
}

export default Layout;
