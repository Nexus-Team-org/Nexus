import type { routesTypes } from "@/types/routesTypes";
import { lazy } from "react";

const Dummy = lazy(() => import("@/pages/dummy/Dummy"));

export const routes: routesTypes[] = [
  {
    path: "/about",
    component: Dummy,
    isProtected: true,
  },
];
