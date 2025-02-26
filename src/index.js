import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./assets/css/tailwind.output.css";
import App from "./App";
import { SidebarProvider } from "./context/SidebarContext";
import ThemedSuspense from "./components/ThemedSuspense";
import { Windmill } from "@windmill/react-ui";
import * as serviceWorker from "./serviceWorker";

// Import and register Chart.js components
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Register the components
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// if (process.env.NODE_ENV !== 'production') {
//   const axe = require('react-axe')
//   axe(React, ReactDOM, 1000)
// }
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

ReactDOM.render(
  <SidebarProvider>
    <Suspense fallback={<ThemedSuspense />}>
      <Windmill usePreferences>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </Windmill>
    </Suspense>
  </SidebarProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
