import { Shrtlnk } from "@prisma/client";
import { useState } from "react";
import {
  Link,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix";
import { getShrtlnk } from "~/shrtlnk.server";
import styles from "~/styles/newLinkAdded.css";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export const meta: MetaFunction = () => ({
  title: "Success!",
});

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const shrtlnk = await getShrtlnk(key!);
  return shrtlnk ? shrtlnk : redirect("/notFound");
};

export default function NewLinkAddec() {
  const shrtlnk = useLoaderData<Shrtlnk>();
  const [showTooltip, setShowTooltip] = useState(false);
  const [urlWasCopied, setUrlWasCopied] = useState(false);

  function setUrlToClipboard() {
    const type = "text/plain";
    const blob = new Blob([`shrtlnk.dev/${shrtlnk.key}`], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
      () => setUrlWasCopied(true),
      () => setUrlWasCopied(false)
    );
  }

  return (
    <main>
      <Link className="home-link" to="/">
        <h1 className="title">
          <span>s</span>
          <span>h</span>
          <span>r</span>
          <span>t</span>
          <span>L</span>
          <span>n</span>
          <span>k</span>
        </h1>
      </Link>
      <div className="new-link-container">
        <h1 className="box-title">SUCCESS! HERE{"'"}S YOUR NEW LINK:</h1>
        <ul>
          <li id="new-link-li">
            <strong className="text-left">SHORTENED URL: </strong>
            <Link id="shrtlnk" to={`/${shrtlnk.key}`} reloadDocument>
              shrtlnk.dev/{shrtlnk.key}
            </Link>
            <img
              onClick={setUrlToClipboard}
              onMouseOver={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              alt="copy to clipboard icon"
              id="copy-icon"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAYAAADFeBvrAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMlSURBVGhD7dpL6ExhGMfxcUkWyqUUCrmsWMgll5J7uS1IpBSJiLJRShY2Fi4LygolpSgsWLAgJUVSlIVIFkpyDcmlyPX7K6eeeeeZmXPOvOc/8+f86tMs5rzvOc+ZOefMvO9biZgRuIjPeIDl6Lbphfv4bfzAFHSLzMZd/IQtopGX2IXe6KgsRpZCQifRMemJp/AONAt9wm1JPww0JsEe2He8T+ELbLt9sP1KDxQS3a2O4g3sQXhuIE22wmtvfcNVLES0zILOqLdDT8yCrP1oOUPxDt4O6imqINmAlnIIXseN3MHoFHbDa9+IbvN6vuXOE3gdt9MM5IrOhPds0YWqB6j1AuF2WXh96tPwtl2LXOkPr0M9c8LoK1TvAJrRSduMMLqNe9vr2suVLAUpuoEcwHWEZ9tzG6egu6iXthcUO9vgnYiVyJV2FxQ9ZUEZ0wfjMRcLcpiDcUj916OognRHPIEP8PrP6i2OYBgapoiC1uErvH5b9QkrUDexC1oPr7+YfmEZ3MQsaCz0ayDsSwMn53Euhwt4jLBPfVJDUJOYBekBavvQ35HViJGN0KiS7f8wahKroL7QWbN95H441skm2P5fQUMDVYlV0GTY9vcQO/qrruOy+xmFqsQqaBFs+zMoIpdh9zMdVYlV0FLY9qdRRC7B7mcmqlIWVCf/XUETsTMH/Y6z6ZiC8oz+yBrYlAUlyoJg2//z11CslAUlyoJg24cFaaLrWA5TYdMxBZW37b/KgjRuZjdIaG7U+49v7UGSZgWNwaocNE1q07QgJe+Mgp3Fa1ZQrKQqSOsH7EZp3UQSTfja986iiFyB3c801EQ/L7zhp2YeIYl+2tj3HiJ2NCDyHHY/I+FGo51ae2A3bkajPLoGFb2Gw74adIyZ7bD9P0PDNQ76Pt6CRiZtw0aWIMlx2PdU8Ba0urBCn8wOhMPLmnhLFc3SqThvNiCkQfkkwxGuHBF9Ta5Biyuy0kzha4R9ahnCIBQeDaS3ssApDV0a89Fl0UD6R3gH0yot25mHLs9gHIQuXO/AstJair0YgLZGNwRNUum2ruHirCbAnWWoTqXyB88RDzCoi2fJAAAAAElFTkSuQmCC"
            />
            <div id="tooltip" className={showTooltip ? "tooltip" : " hidden"}>
              {urlWasCopied ? "Copied!" : "Click to copy URL"}
            </div>
          </li>
          <li>
            <strong className="text-left">FULL URL: </strong>
            <Link id="full-link" to={shrtlnk.url} reloadDocument>
              {shrtlnk.url}
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
