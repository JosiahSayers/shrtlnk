import {
  Link,
  LinksFunction,
  ActionFunction,
  useActionData,
  json,
  Form,
  redirect,
} from "remix";
import joi from "joi";
import styles from "~/styles/index.css";
import { createShrtlnk } from "~/shrtlnk";

const validateUrl = (
  url: FormDataEntryValue | string | null
): joi.ValidationResult<string> => {
  const urlSchema = joi.string().label("URL").uri();
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

  const validationResult = validateUrl(formData.get("url"));

  if (validationResult.error) {
    return json(
      {
        errors: { url: validationResult.error.message },
        values: { url: validationResult.value },
      },
      { status: 400 }
    );
  }

  const link = await createShrtlnk(
    validationResult.value,
    process.env.API_KEY!
  );

  if (!link) {
    return json({
      errors: { url: "Something went wrong, please try again " },
      values: { url: validationResult.value },
    });
  }

  return redirect(`/new-link-added?key=${link.key}`);
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
        {actionData?.errors?.url && (
          <p className="error">{actionData?.errors?.url}</p>
        )}
        <input className="button" type="submit" value="Create Short Link" />
      </Form>
      <footer>
        <span>Pssst, are you a developer? We have an </span>
        <Link to="/developer">API</Link>.
      </footer>
    </main>
  );
}
