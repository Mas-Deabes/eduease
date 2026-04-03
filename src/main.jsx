import React from "react";
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles/global.css" //importing the css here applies the theme to the entire app as this is the starting point
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <App />
    </AuthProvider>
  </React.StrictMode>
) 