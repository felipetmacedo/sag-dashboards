import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Login from "@/features/Login";
import About from "@/features/About";
import { PublicLayout } from "@/layouts/PublicLayout";
import Dashboard from "@/features/Dashboard"
import Ranking from "@/features/Ranking";
import Vendas from "@/features/Vendas";
import Relatorios from "@/features/Relatorios";

export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        children: [
            {
                path: "/",
                element: <About />
            },
            {
                path: "/login",
                element: <Login />
            },
        ]
    },
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "ranking",
                element: <Ranking />
            },
            {
                path: "vendas",
                element: <Vendas />
            },
            {
                path: "relatorios",
                element: <Relatorios />
            }
        ]
    }
]);