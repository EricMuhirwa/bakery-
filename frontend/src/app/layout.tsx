"use client";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { Toaster } from "sonner";
import Head from "next/head";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <Head>
                <title>Bakery CEBK Ltd</title>
                <meta name="description" content="Umurava Platform" />
                <link rel="icon" href="/umurava.ico" />
                <link rel="apple-touch-icon" href="/umurava.png" />
            </Head>
            <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
                <SessionProvider>
                    <Provider store={store}>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <Toaster position={`top-right`} />
                            <main className="flex-grow">{children}</main>
                        </ThemeProvider>
                    </Provider>
                </SessionProvider>
            </body>
        </html>
    );
}
