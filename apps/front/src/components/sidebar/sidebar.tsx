import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { UserCog, LogOut, LayoutDashboard, Users, UsersRound, Link as LinkIcon, Search, List, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { logout } from "@/utils/storage";
import { useUserStore } from "@/stores/user.store";
import ApolloMonogram from "@/assets/img/monogram-apollo.png";
import ApolloLogo from "@/assets/img/logo-apollo.png";
import { motion } from "framer-motion";

// Define a common interface for all navigation links
interface NavLink {
    label: string;
    href: string;
    icon: React.ReactNode;
    action?: () => Promise<void> | void;
}

export default function SideBar({ children }: { children: React.ReactNode }) {
    const { userInfo, clearUserInfo } = useUserStore();
    const navigate = useNavigate();
    const [open, setOpen] = useState(true);

    const handleLogout = async () => {
        logout()

        clearUserInfo();
        navigate("/login");
        toast.success("Deslogado com sucesso!")
    };

    // Generate dynamic links based on permissions
    const getPermissionLinks = () => {
        const permissionLinks: NavLink[] = [];

        if (userInfo?.permissions) {

            // Check for READ TEAMS permission
            if (userInfo.permissions.some(perm => perm.name === 'READ' && perm.module === 'TEAMS')) {
                permissionLinks.push({
                    label: "Líderes",
                    href: "/teams",
                    icon: <UsersRound className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                });
            }

            if (userInfo.permissions.some(perm => perm.name === 'READ' && perm.module === 'LISTS')) {
                permissionLinks.push({
                    label: "Listas",
                    href: "/lists",  
                    icon: <List className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                });
            }

            if (userInfo.permissions.some(perm => perm.name === 'READ' && perm.module === 'USERS')) {
                permissionLinks.push({
                    label: "Usuários",
                    href: "/users",
                    icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                },{
                    label: "Indicações",
                    href: "/invitation",
                    icon: <LinkIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                });
            }

            // Check for READ REQUESTS permission
            if (userInfo.permissions.some(perm => perm.name === 'READ' && perm.module === 'REQUESTS')) {
                permissionLinks.push({
                    label: "Limpa Nome",
                    href: "/requests",
                    icon: <ShieldCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                }, {
                    label: "Consultas",
                    href: "/consultas",
                    icon: <Search className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                }, {
                    label: "Indicações",
                    href: "/invitation",
                    icon: <LinkIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
                });
            }
		}

		return permissionLinks;
	};

	// Combine standard links with permission-based links
    const standardLinks: NavLink[] = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
    ];
    
    const profileAndLogoutLinks: NavLink[] = [
        {
            label: "Perfil",
            href: "/profile",
            icon: <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
			label: 'Logout',
			href: '#',
			icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
			action: handleLogout,
        },
    ];
    
    // Combine all links
    const links = [...standardLinks, ...getPermissionLinks(), ...profileAndLogoutLinks];

    return (
        <div className={cn("flex flex-col md:flex-row dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden", "h-screen w-screen")}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="relative h-6">
                            <motion.div
                                animate={{
                                    opacity: open ? 1 : 0,
                                    display: open ? "block" : "none"
                                }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0"
                            >
                                <Logo />
                            </motion.div>
                            <motion.div
                                animate={{
                                    opacity: open ? 0 : 1,
                                    display: open ? "none" : "block"
                                }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0"
                            >
                                <LogoIcon />
                            </motion.div>
                        </div>
                        <div className="mt-4 flex flex-col gap-2 ml-1">
                        {links.map((link, idx) => {
                            const { action, ...linkWithoutAction } = link;
                            
                            if (action) {
                                return (
                                    <div key={idx} onClick={action}>
                                        <SidebarLink 
                                            link={linkWithoutAction}
                                        />
                                    </div>
                                );
                            }
                            
                            return <SidebarLink key={idx} link={linkWithoutAction} />;
                        })}
                        </div>
                    </div>
                    <div className={cn("flex items-center transition-all duration-300", open ? "justify-start gap-2 text-ellipsis overflow-hidden" : "justify-center w-full")}>
                        <SidebarLink
                            link={{
                                label: open ? userInfo?.name || "" : "",
                                href: "/profile",
                                icon: (
                                    <span className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 ml-2 mb-1">
                                        {userInfo?.name?.charAt(0)}
                                    </span>
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            {children}
        </div>
    );
}

export const Logo = () => (
    <Link to="#" className="flex items-center justify-start h-full">
        <img
            src={ApolloLogo}
            alt="logo"
            className="h-6 object-contain"
        />
    </Link>
);

export const LogoIcon = () => (
    <div className="flex items-center justify-center h-full">
        <img
            src={ApolloMonogram}
            alt="logo"
            className="h-8 w-8 object-contain"
        />
    </div>
);
