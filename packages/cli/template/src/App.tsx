import { Route, Routes } from "react-router";
import "./App.css";
import { routes } from "./routes";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "./components/PublicRouter";
import Page404 from "./pages/404/Page404";
import Home from "./pages/Home/Home";
import { Suspense } from "react";
import Loading from "./components/Loading";

function App() {
  return (
    <Routes>
      {routes.map(
        ({ path, component: Component, isProtected, allowedRoles }, index) => {
          const element = isProtected ? (
            <ProtectedRoute allowedRoles={allowedRoles}>
              <Component />
            </ProtectedRoute>
          ) : (
            <PublicRoute allowedRoles={allowedRoles}>
              <Component />
            </PublicRoute>
          );

          return (
            <Route
              key={index}
              path={path}
              element={<Suspense fallback={<Loading fullscreen/>}>{element}</Suspense>}
            />
          );
        }
      )}
      <Route index element={<Home />} />

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

export default App;
