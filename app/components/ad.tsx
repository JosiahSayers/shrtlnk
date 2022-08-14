import { useLocation } from "@remix-run/react";

export default function AdSense() {
  const { pathname } = useLocation();
  if (!pathname.includes("developer")) {
    return (
      <>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5073920211334393"
          crossOrigin="anonymous"
        ></script>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-5073920211334393"
          data-ad-slot="9768400304"
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </>
    );
  }
  return null;
}
