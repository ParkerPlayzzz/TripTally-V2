import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalDataProvider } from "./context/LocalDataContext";
import { TransparencyProvider } from "@/lib/TransparencyContext";
import { FontSizeProvider } from "@/lib/FontSizeContext";
import { TimeFormatProvider } from "@/lib/TimeFormatContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TransparencyProvider>
      <FontSizeProvider>
        <TimeFormatProvider>
          <LocalDataProvider>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </LocalDataProvider>
        </TimeFormatProvider>
      </FontSizeProvider>
    </TransparencyProvider>
  </React.StrictMode>,
);