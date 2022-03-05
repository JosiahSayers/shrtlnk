import { Link, LinksFunction, MetaFunction } from "remix";
import Card from "~/components/developer/card";
import styles from "~/styles/developer/index.css";

export const meta: MetaFunction = () => ({
  title: "Developer Portal - shrtlnk - Simple Link Shortener",
});

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export default function DeveloperHome() {
  return (
    <div className="container">
      <h1 className="center display-3">Welcome, artisan of the internet!</h1>

      <div className="center" id="blurb">
        <span className="lead">
          Shrtlnk strives to be the easiest API to integrate into your project.
          <br />
        </span>
        <strong className="h4">Here's our onboarding process:</strong>
      </div>

      <div className="row">
        <div className="col">
          <Card
            title="Create an account"
            text="Click the button below to get started."
            linkUrl="/developer/register"
            linkText="Create Account"
          />
        </div>

        <div className="col">
          <Card
            title="Add an application"
            text="You can have as many applications as you would like, we don't like limits here!"
            linkUrl="/developer/signin"
            linkText="Sign In"
          />
        </div>

        <div className="col">
          <Card
            title="Use the API"
            text="Each application will be given a private API key, use that to call shrtlnk"
            linkUrl="/developer/documentation"
            linkText="View Documentation"
          />
        </div>
      </div>
    </div>
  );
}
