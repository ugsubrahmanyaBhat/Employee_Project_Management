import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router.jsx";
import { AuthContextProvider } from "./context/Authcontext.jsx";
import { Provider } from "react-redux";
import { store } from "./store.js";



createRoot(document.getElementById("root")).render(
  <StrictMode>
      <AuthContextProvider>
        <Provider store={store}>
        <RouterProvider router={router} />
        </Provider>
      </AuthContextProvider> 
  </StrictMode>
);
