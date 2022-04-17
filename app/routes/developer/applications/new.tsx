import {
  Box,
  Button,
  Heading,
  Stack,
  toast,
  useColorModeValue,
} from "@chakra-ui/react";
import Joi from "joi";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import { createApp } from "~/application.server";
import TextInput from "~/components/developer/text-input";
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
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"}>Create a new application</Heading>
      </Stack>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Form method="post" noValidate>
          <Stack spacing={4}>
            <TextInput
              errorMessage={actionData?.errors?.name}
              defaultValue={actionData?.fields?.name}
              name="name"
              type="name"
              label="Application Name"
              isRequired
            />
            <TextInput
              errorMessage={actionData?.errors?.website}
              defaultValue={actionData?.fields?.website}
              name="website"
              type="website"
              label="URL of Application"
              helperText="If this is a mobile app, put the URL to the app store page. Otherwise, leave blank for now and fill in later."
            />
            <Stack spacing={10}>
              <Button
                bg={"blue.400"}
                color={"white"}
                type="submit"
                onClick={() => toast.closeAll()}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Create
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Stack>
  );
}
