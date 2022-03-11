import { Application } from "@prisma/client";
import Joi, { string } from "joi";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { getApp, updateApp } from "~/application.server";
import { requireUserOwnsApplication } from "~/utils/authorization.server";
import { validate } from "~/utils/get-validation-errors.server";
import { requireUserSession } from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  errors?: {
    name?: string;
    website?: string;
  };
  fields?: {
    name?: string;
    website?: string;
    id?: string;
  };
};

const validateForm = (form: {
  name: FormDataEntryValue | null;
  website: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    website: Joi.string().allow("").optional(),
  });
  return validate<{ name: string; website: string }>(schema, form);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { app } = await requireUserOwnsApplication(request, params.appId);
  return app;
};

export const action: ActionFunction = async ({ request, params }) => {
  const { app } = await requireUserOwnsApplication(request, params.appId);
  const formData = await request.formData();
  const name = formData.get("name");
  const website = formData.get("website");

  const { fields, errors } = validateForm({ name, website });

  if (errors) {
    return json(
      {
        errors,
        fields,
      },
      { status: 400 }
    );
  }

  try {
    await updateApp({ id: app.id, name: fields.name, website: fields.website });
    return redirect("/developer/applications");
  } catch (e) {
    console.log(e);
    return json(
      { formLevelError: "Something went wrong, please try again. " },
      { status: 500 }
    );
  }
};

export default function EditApplication() {
  const actionData = useActionData<ActionData>();
  const loaderData = useLoaderData<Application>();
  const name = loaderData?.name || actionData?.fields?.name;
  const website = loaderData?.website || actionData?.fields?.website;
  const id = loaderData?.id || actionData?.fields?.id;

  return (
    <div className="container">
      <div className="card pt-4 pb-4 pr-4 pl-4">
        <Form method="post">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              className="form-control"
              placeholder="Name"
              name="name"
              defaultValue={name}
            />
            {actionData?.errors?.name && (
              <span className="text-danger">{actionData.errors.name}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              className="form-control"
              name="website"
              placeholder="URL"
              defaultValue={website}
            />
            {actionData?.errors?.website && (
              <span asp-validation-for="Website" className="text-danger">
                {actionData.errors.website}
              </span>
            )}
          </div>
          <input type="hidden" name="id" defaultValue={id} />
          <input type="submit" className="btn btn-primary" value="Submit" />
        </Form>
      </div>
    </div>
  );
}
