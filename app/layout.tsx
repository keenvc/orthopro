import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import dynamic from "next/dynamic";
import "./globals.css";

// Load RingCentral phone dynamically (client-side only)
const RingCentralPhone = dynamic(() => import("./components/RingCentralPhone"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OrthoPro",
  description: "Orthopedic Practice Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="marker-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.markerConfig = {
                project: '68fdd9e26e5cdfe5706269d3', 
                source: 'snippet'
              };

              !function(e,r,a){if(!e.__Marker){e.__Marker={};var t=[],n={__cs:t};["show","hide","isVisible","capture","cancelCapture","unload","reload","isExtensionInstalled","setReporter","clearReporter","setCustomData","on","off"].forEach(function(e){n[e]=function(){var r=Array.prototype.slice.call(arguments);r.unshift(e),t.push(r)}}),e.Marker=n;var s=r.createElement("script");s.async=1,s.src="https://edge.marker.io/latest/shim.js";var i=r.getElementsByTagName("script")[0];i.parentNode.insertBefore(s,i)}}(window,document);
            `
          }}
        />
        <Script
          id="ringcentral-phone"
          strategy="lazyOnload"
          src="https://apps.ringcentral.com/integration/ringcentral-embeddable/2.x/adapter.js"
        />
      </head>
      <body className={inter.className}>
        {children}
        <RingCentralPhone />
      </body>
    </html>
  );
}
