import './theme/index.css';
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { Toaster } from 'sonner'


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export function Root() {
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster
                expand={false}
                richColors
                closeButton
            />
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}
