import "../../public/assets/css/animate.css";
import "./globals.css";

import type { Metadata } from "next";
import { TemplateScripts } from "../components/TemplateScripts";

export const metadata: Metadata = {
  title: "Andreza & Ismael - 3 de Maio de 2026",
  icons: [{ rel: "icon", url: "/assets/images/logo-sem-fundo.png" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="/assets/css/themify-icons.css" />
        <link rel="stylesheet" href="/assets/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/assets/css/flaticon.css" />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/css/owl.carousel.css" />
        <link rel="stylesheet" href="/assets/css/owl.theme.css" />
        <link rel="stylesheet" href="/assets/css/slick.css" />
        <link rel="stylesheet" href="/assets/css/slick-theme.css" />
        <link rel="stylesheet" href="/assets/css/swiper.min.css" />
        <link rel="stylesheet" href="/assets/css/nice-select.css" />
        <link rel="stylesheet" href="/assets/css/owl.transitions.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/jquery.fancybox.css" />
        <link rel="stylesheet" href="/assets/css/odometer-theme-default.css" />
        <link rel="stylesheet" href="/assets/css/jquery-ui.css" />
        <link rel="stylesheet" href="/assets/sass/style.css" />
      </head>

      <body>
        {children}
        <TemplateScripts />
      </body>
    </html>
  );
}
