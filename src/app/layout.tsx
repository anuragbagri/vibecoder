import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <TRPCReactProvider>
        <body>{children}</body>
      </TRPCReactProvider>
    </html>
  );
}
