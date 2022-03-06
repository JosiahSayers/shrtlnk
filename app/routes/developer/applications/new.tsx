import Joi, { string } from "joi";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import { createApp } from "~/application.server";
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

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
  return json(userInfo);
};

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
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
    await createApp({
      name: fields.name,
      website: fields.website,
      userId: userInfo.id,
    });
    return redirect("/developer/applications");
  } catch (e) {
    console.log(e);
    return json(
      {
        formLevelError: "Something went wrong, please try again",
      },
      { status: 500 }
    );
  }
};

export default function NewApplication() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="container">
      <div className="card pt-4 pb-4 pr-4 pl-4">
        <form method="post">
          <div className="form-group">
            <label htmlFor="name">Application Name</label>
            <input className="form-control" placeholder="Name" name="name" />
            {actionData?.errors?.name && (
              <span className="text-danger">{actionData.errors.name}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="website">
              URL of application. (If this is a mobile app, put the URL to the
              app store page if it is available. Otherwise, leave blank for now
              and fill in later.)
            </label>
            <input className="form-control" name="website" placeholder="URL" />
            {actionData?.errors?.website && (
              <span className="text-danger">{actionData?.errors?.website}</span>
            )}
          </div>
          <input type="submit" value="Submit" className="btn btn-primary" />
        </form>
      </div>
    </div>
  );
}
