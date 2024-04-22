import { Link as ChakraLink } from "@chakra-ui/react";
import { ActionFunction, LinksFunction, redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useField, ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import WebsiteTitle from "~/components/title";
import { createShrtlnk } from "~/shrtlnk.server";
import styles from "~/styles/index.css";
import { logger } from "~/utils/logger.server";

export const urlSchema = z
  .string()
  .min(1, "url is required")
  .transform((u) => {
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      return `https://${u}`;
    }
    return u;
  })
  .refine(
    (u) => {
      try {
        new URL(u);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "not a valid url",
    }
  );

const schema = z.object({
  url: urlSchema,
});
export const validator = withZod(schema);

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const validationResult = await validator.validate(await request.formData());

  if (validationResult.error) {
    return validationError(
      validationResult.error,
      validationResult.submittedData
    );
  }

  let link;
  try {
    link = await createShrtlnk(validationResult.data.url, process.env.API_KEY!);
  } catch (e: any) {
    logger.error(e, "Failed creating link from home page");
    // throw away unsafe URL error and return generic error
  }

  if (!link) {
    return validationError(
      { fieldErrors: { url: "Something went wrong, please try again" } },
      validationResult.submittedData
    );
  }

  return redirect(`/new-link-added?key=${link.key}`);
};

export default function Index() {
  const actionData = useActionData<typeof action>();
  const { error, getInputProps } = useField("url", { formId: "url-form" });

  return (
    <main>
      <WebsiteTitle />
      <ValidatedForm
        method="post"
        id="url-form"
        validator={validator}
        defaultValues={actionData?.fields}
      >
        <label htmlFor="url">URL TO SHORTEN:</label>
        <input
          {...getInputProps()}
          className="text"
          type="text"
          name="url"
          id="url"
          defaultValue={actionData?.values?.url}
        />
        {error && <p className="error">{error}</p>}
        <input className="button" type="submit" value="CREATE SHORT LINK" />
      </ValidatedForm>
      <footer>
        <span>Pssst, are you a developer? We have an </span>
        <ChakraLink
          as={Link}
          to="/developer"
          textDecoration="underline"
          color="white"
        >
          API
        </ChakraLink>
        .
      </footer>
    </main>
  );
}
