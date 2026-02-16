"use client" 
import { Home, Coffee, Users, HelpCircle, LogOut, Menu, X, DollarSign, Box, ShoppingCart, Factory } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ConfimrDialog } from "./confirmDialog";

const items = [
    {
        title: "Home",
        url: "/admin",
        icon: Home,
    },
    {
        title: "CEBK Management",
        url: "/admin/coffee",
        icon: Coffee,
    },
   
    {
        title: "Raw Materials Form",
        url: "/admin/raw-materials",
        icon: Box,
    },

    
    {
        title: "Daily Production",
        url: "/admin/daily-production",
        icon: Factory,
    },
    {
        title: "Sales Form",
        url: "/admin/daily-sales",
        icon: ShoppingCart,
    },
    {
        title: "Stock Management",
        url: "/admin/stock",
        icon: Box,
    },
   
    {
        title: "Subscribtions",
        url: "/admin/subscribers",
        icon: DollarSign,
    },
    {
        title: "Payments",
        url: "/admin/payment",
        icon: Users,
    },
    
    {
        title: "Setting",
        url: "/admin/setting",
        icon: HelpCircle,
    }
];

export default function SideBar() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const params = usePathname();
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const logoutFunc = async () => {
        await signOut({ callbackUrl: "/" });
    }

    return (
        <div className="w-[70%] md:w-[22%] z-[1000] h-screen fixed">
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed top-4 right-2 z-50 p-2 text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: '#BF6006' }}
                aria-label="Toggle Menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav
                className={`
                    inset-y-0 left-0 
                    h-full
                    w-full
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                    z-40
                    pr-2
                    flex flex-col justify-between
                `}
                style={{ backgroundColor: '#BF6006' }}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 flex items-center gap-3">
                        <Image
                            src="/logo.jpg"
                            alt="logo"
                            width={60}
                            height={60}
                            style={{ borderRadius: "50%" }}
                        />
                    </div>

                    <div className="flex-1 px-2 py-4">
                        <ul className="space-y-2">
                            {items.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.url}
                                        className={`flex text-[14px] items-center gap-3 px-4 py-3 hover:text-[#BF6006] rounded-lg hover:bg-white/80 transition-colors ${params === item.url ? 'bg-white text-[#BF6006]' : 'text-white'}`}
                                        onClick={() => setIsMobileOpen(false)}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-[40px] px-2 py-4">
                    <div className="space-y-2">
                        <li>
                            <button
                                onClick={() => setIsConfirmDialogOpen(true)}
                                className="flex text-[14px] items-center gap-3 px-4 py-2 text-white hover:text-[#BF6006] rounded-lg hover:bg-white transition-colors w-full text-left"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </li>
                    </div>
                </div>
            </nav>

            <ConfimrDialog 
                open={isConfirmDialogOpen} 
                setOpen={setIsConfirmDialogOpen} 
                title="Are you sure you want to logout" 
                description="If you click to continue you will no longer have access to this dashboard until you log in again" 
                confirmFunc={logoutFunc} 
            />
        </div>
    );
}
