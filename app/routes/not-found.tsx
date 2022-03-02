import { LinksFunction, MetaFunction } from "remix";
import styles from "~/styles/not-found.css";

export const meta: MetaFunction = () => ({
  title: "Success!",
});

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export default function NotFound() {
  return (
    <div className="main">
      <h1>Uh-oh! We can't find that Short Link in our database.</h1>
    </div>
  );
}
