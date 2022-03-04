import { LinksFunction, MetaFunction } from "remix";
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
          Shrtlnk strives to be the easiest API to integrate into your project.{" "}
          <br />
        </span>
        <strong className="h4">Here's our onboarding process:</strong>
      </div>

      <div className="row">
        <div className="col">
          <div className="card text-center">
            <div className="card-body">
              <div>
                <h5 className="card-title">Create an account</h5>
                <p className="card-text">
                  Click the button below to get started.
                </p>
              </div>
              <a
                asp-controller="Developer"
                asp-action="Register"
                className="btn btn-primary"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card text-center">
            <div className="card-body">
              <div>
                <h5 className="card-title">Add an application</h5>
                <p className="card-text">
                  You can have as many applications as you would like, we don't
                  like limits here!
                </p>
              </div>
              <a
                asp-controller="Developer"
                asp-action="SignIn"
                className="btn btn-primary"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card text-center">
            <div className="card-body">
              <div>
                <h5 className="card-title">Use the API</h5>
                <p className="card-text">
                  Each application will be given a private API key, use that to
                  call shrtlnk
                </p>
              </div>
              <a
                asp-controller="Developer"
                asp-action="Documentation"
                className="btn btn-primary"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
