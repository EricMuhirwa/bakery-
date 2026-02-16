"use client";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/admincomp/Navbar";
import AdminSideBar from "@/components/admincomp/Sidebar";

interface UserProfile {
    username: string;
    email: string;
    role: string;
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState<boolean | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const session = await getSession();

            if (!session) {
                setIsAuth(false);
                router.replace("/auth"); // Redirect if not authenticated
            } else {
                setIsAuth(true);
                setUserProfile({
                    username: session.user.name ?? '',
                    email: session.user.email ?? '',
                    role: session.user.role ?? '',
                });
            }
        };

        checkSession();
    }, [router]);

    // Show loading screen while checking authentication
    if (isAuth === null) {
        return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    }

    // Render Admin Panel only if the user is authenticated and is an admin
    if (isAuth && userProfile?.role === "admin") {
        return (
            <div className="flex flex-row w-full min-h-screen bg-[#F9FAFB]">
                <AdminSideBar />
                <div className="flex flex-col ml-auto w-full lg:w-[78%]">
                    <Navbar />
                    {children}
                </div>
            </div>
        );
    }

    // Redirecting already, so return null
    return null;
}
