import { ChakraProvider } from "@chakra-ui/react";
import { withEmotionCache } from "@emotion/react";
import { useContext, useEffect } from "react";
import {
  ErrorBoundaryComponent,
  LinksFunction,
  V2_MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import styles from "~/styles/root.css";
import { ServerStyleContext, ClientStyleContext } from "./context";
import WebsiteTitle from "~/components/title";

export const meta: V2_MetaFunction = () => [
  { charset: "utf-8" },
  { title: "shrtlnk - Simple Link Shortener" },
  { name: "viewport", content: "width=device-width,initial-scale=1" },
  { name: "propeller", content: "ca94f7201f84b75922ec54935ae6a1ce" },
];

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstaticom" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css?family=Luckiest+Guy",
    },
    {
      rel: "icon",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "icon",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      sizes: "192x192",
      href: "/android-chrome-192x192.png",
    },
    {
      rel: "icon",
      sizes: "512x512",
      href: "/android-chrome-512x512.png",
    },
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const ErrorBoundary: ErrorBoundaryComponent = () => {
  const error = useRouteError();
  console.log(error);

  return (
    <Document>
      <ChakraProvider>
        <main>
          <WebsiteTitle />
          <div className="error">
            <h1>Something went wrong, sorry about that!</h1>
          </div>
        </main>
      </ChakraProvider>
    </Document>
  );
};
interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverStyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
          {serverStyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

export default function App() {
  return (
    <Document>
      <ChakraProvider>
        <Outlet />
      </ChakraProvider>
    </Document>
  );
}
