import {
  Box,
  Button,
  Heading,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { Application } from "@prisma/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import Joi from "joi";
import { useEffect } from "react";
import { updateApp } from "~/application.server";
import TextInput from "~/components/developer/text-input";
import { requireUserOwnsApplication } from "~/utils/authorization.server";
import { validate } from "~/utils/get-validation-errors.server";

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
  const { name, website } = await parseForm(request);

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
  const { submission } = useTransition();
  const name = loaderData?.name || actionData?.fields?.name;
  const website = loaderData?.website || actionData?.fields?.website;
  const id = loaderData?.id || actionData?.fields?.id;

  const toast = useToast();

  useEffect(() => {
    if (actionData?.formLevelError) {
      toast({
        title: "Error",
        description: actionData.formLevelError,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [actionData]);

  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"}>Edit Application ({loaderData.name})</Heading>
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
              defaultValue={name}
              name="name"
              type="text"
              label="Application Name"
              isRequired
            />
            <TextInput
              errorMessage={actionData?.errors?.website}
              defaultValue={website}
              name="website"
              type="text"
              label="URL of Application"
              helperText="If this is a mobile app, put the URL to the app store page. Otherwise, leave blank for now and fill in later."
            />
            <input type="hidden" name="id" defaultValue={id} />
            <Stack spacing={10}>
              <Button
                bg={"blue.400"}
                color={"white"}
                type="submit"
                onClick={() => toast.closeAll()}
                _hover={{
                  bg: "blue.500",
                }}
                isLoading={!!submission}
              >
                Update
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Stack>
  );
}
