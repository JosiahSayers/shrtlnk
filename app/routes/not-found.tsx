import { MetaFunction } from "@remix-run/node";
import WebsiteTitle from "~/components/title";

export const meta: MetaFunction = () => ({
  title: "Not Found!",
});

export default function NotFound() {
  return (
    <main>
      <WebsiteTitle />
      <div className="error">
        <h1>UH-OH! WE CAN{"'"}T FIND THAT SHORT LINK IN OUR DATABASE.</h1>
      </div>
    </main>
  );
}
