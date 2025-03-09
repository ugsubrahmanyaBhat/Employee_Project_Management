import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router.jsx";
import { AuthContextProvider } from "./context/Authcontext.jsx";



createRoot(document.getElementById("root")).render(
  <StrictMode>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider> 
  </StrictMode>
);
