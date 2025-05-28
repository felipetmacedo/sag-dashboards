import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Login from "@/features/Login";
import { Profile } from "@/features/Profile/Profile";
import About from "@/features/About";
import { PublicLayout } from "@/layouts/PublicLayout";
import Dashboard from "@/features/Dashboard"
import Teams from "@/features/Teams";
import Users from "@/features/Users";
import Requests from "@/features/Requests";
import Invitation from "@/features/Invitation";
import ConsultasOfc from "@/features/ConsultasOfc";
import Lists from "@/features/Lists";
import ListView from "@/features/ListView";

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
                path: "profile",
                element: <Profile />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "teams",
                element: <Teams />
            },
            {
                path: "users",
                element: <Users />
            },
            {
                path: "requests",
                element: <Requests />
            },
            {
                path: "invitation",
                element: <Invitation />
            },
            {
                path: "consultas",
                element: <ConsultasOfc />
            },
            {
                path: "lists",
                element: <Lists />
            },
            {
                path: "lists/:id",
                element: <ListView />
            }
        ]
    }
]);