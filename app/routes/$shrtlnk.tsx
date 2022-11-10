import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import VignetteBannerAd from "~/components/ads/vignette-banner";
import { getShrtlnk } from "~/shrtlnk.server";

export const loader: LoaderFunction = async ({ params }) => {
  const link = await getShrtlnk(params.shrtlnk!, true);

  if (!link) {
    return redirect("/not-found");
  }

  if (!link.eligibleForAd) {
    return redirect(link.url);
  }

  return json(link);
};

export default function RedirectPage() {
  const link = useLoaderData();
  const adSeconds = 10;
  const [timeoutRef, setTimeoutRef] = useState<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!timeoutRef) {
      setTimeoutRef(
        setTimeout(() => (window.location.href = link.url), adSeconds * 1000)
      );
    }

    return () => {
      clearTimeout(timeoutRef as any);
    };
  }, []);

  return (
    <>
      <h1>
        Redirecting you to: <a href={link.url}>{link.url}</a> in{" "}
        <Countdown
          date={Date.now() + adSeconds * 1000}
          renderer={({ seconds }) => <span>{seconds} seconds</span>}
        />
      </h1>
      <VignetteBannerAd />
    </>
  );
}
