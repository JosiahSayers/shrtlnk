import {
  Box,
  Heading,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { validationError } from "remix-validated-form";
import { updateApp } from "~/application.server";
import ApplicationForm, {
  applicationFormValidator,
} from "~/components/developer/applications/app-form";
import { requireUserOwnsApplication } from "~/utils/authorization.server";
import { logger } from "~/utils/logger.server";

interface LoaderData {
  id: string;
  name: string;
  website: string;
}

interface ActionData {
  formLevelError?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { app } = await requireUserOwnsApplication(request, params.appId);
  return json<LoaderData>({
    name: app.name,
    website: app.website ?? "",
    id: app.id,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { app } = await requireUserOwnsApplication(request, params.appId);
  const validationResult = await applicationFormValidator.validate(
    await request.formData()
  );
  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  try {
    const { name, website } = validationResult.data;
    await updateApp({ id: app.id, name, website });
    return redirect("/developer/applications");
  } catch (e) {
    logger.log("Failed to edit application", e);
    return json(
      { formLevelError: "Something went wrong, please try again. " },
      { status: 500 }
    );
  }
};

export default function EditApplication() {
  const actionData = useActionData<ActionData>();
  const loaderData = useLoaderData<LoaderData>();
  const name = loaderData?.name;
  const website = loaderData?.website;

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
        <ApplicationForm
          defaultValues={{ name, website }}
          submitButtonText="Update"
        />
      </Box>
    </Stack>
  );
}
