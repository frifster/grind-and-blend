import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@components/Layout/Footer";

import "./globals.css";
import MainContainer from "@components/Layout/MainContainer";

import NavBar from "@components/Layout/NavBar";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import Head from "next/head";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Grind & Blend",
  description: "Grind and Blend website"
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout(props: RootLayoutProps) {

  return (
    <html lang="en">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <AuthProvider>
          <Analytics />
          <NavBar />
          <MainContainer>
            {props.children}
          </MainContainer>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}