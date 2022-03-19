import {
  Links,
  LinksFunction,
  MetaFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  ErrorBoundaryComponent,
} from "remix";
import styles from "~/styles/root.css";

export const meta: MetaFunction = () => {
  return { title: "shrtlnk - Simple Link Shortener" };
};

export const links: LinksFunction = () => {
  return [
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

export const ErrorBoundary: ErrorBoundaryComponent = ({
  error,
}: {
  error: any;
}) => {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Something went wrong, sorry about that!</h1>
        <Scripts />
      </body>
    </html>
  );
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
