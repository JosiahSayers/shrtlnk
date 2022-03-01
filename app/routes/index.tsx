import {
  Link,
  LinksFunction,
  ActionFunction,
  useActionData,
  json,
  Form,
} from "remix";
import joi from "joi";
import styles from "~/styles/index.css";
import { createShrtlnk } from "~/shrtlnk.server";

const validateUrl = (
  url: FormDataEntryValue | string | null
): joi.ValidationResult<string> => {
  const urlSchema = joi.string().uri();
  return urlSchema.validate(url);
};

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const url = formData.get("url");
  const validationResult = validateUrl(url);

  if (validationResult.error) {
    return json(
      {
        errors: { url: validationResult.error.message },
        values: { url },
      },
      { status: 400 }
    );
  }

  const link = await createShrtlnk(url, process.env.API_KEY);
  return json(link);
  // await createPost({ title, slug, markdown });

  // return redirect("/admin");
};

export default function Index() {
  const actionData = useActionData();

  return (
    <main>
      <h1 className="title">
        <span>S</span>
        <span>h</span>
        <span>r</span>
        <span>t</span>
        <span>L</span>
        <span>n</span>
        <span>k</span>
      </h1>
      <Form method="post">
        <label>
          <h2>URL To Shorten:</h2>
        </label>
        <input
          className="text"
          type="text"
          name="url"
          id="url"
          defaultValue={actionData?.values?.url}
        />
        {actionData?.errors?.url && <p>{actionData?.errors?.url}</p>}
        <input className="button" type="submit" value="Create Short Link" />
      </Form>
      <footer>
        <span>Pssst, are you a developer? We have an </span>
        <Link to="/developer">API</Link>.
      </footer>
    </main>
  );
}
