import { Link as ChakraLink } from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { ActionFunction, json, LinksFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import joi from "joi";
import { createShrtlnk } from "~/shrtlnk.server";
import styles from "~/styles/index.css";

export const validateUrl = (
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
  const formData = await parseForm(request as any);
  const validationResult = validateUrl(formData.url);

  if (validationResult.error) {
    return json(
      {
        errors: { url: validationResult.error.message },
        values: { url: validationResult.value },
      },
      { status: 400 }
    );
  }

  let link;
  try {
    link = await createShrtlnk(validationResult.value, process.env.API_KEY!);
  } catch (e) {
    // throw away unsafe URL error and return generic error
  }

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
        <span>H</span>
        <span>R</span>
        <span>T</span>
        <span>L</span>
        <span>N</span>
        <span>K</span>
      </h1>
      <Form method="post" reloadDocument>
        <label htmlFor="url">URL TO SHORTEN:</label>
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
        <input className="button" type="submit" value="CREATE SHORT LINK" />
      </Form>
      <footer>
        <span>Pssst, are you a developer? We have an </span>
        <ChakraLink
          as={Link}
          to="/developer"
          textDecoration="underline"
          color="gray.700"
        >
          API
        </ChakraLink>
        .
      </footer>
    </main>
  );
}
