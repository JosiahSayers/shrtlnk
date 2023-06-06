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
import { useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { validationError } from "remix-validated-form";
import { createApp } from "~/application.server";
import ApplicationForm, {
  applicationFormValidator,
} from "~/components/developer/applications/app-form";
import { logger } from "~/utils/logger.server";
import { requireUserSession } from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
  return json(userInfo);
};

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
  const validationResult = await applicationFormValidator.validate(
    await request.formData()
  );
  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  try {
    const { name, website } = validationResult.data;
    await createApp({
      name,
      website,
      userId: userInfo.id,
    });
    return redirect("/developer/applications");
  } catch (e) {
    logger.error("Failed to create application", e);
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
        <Heading fontSize={"4xl"}>Create a new application</Heading>
      </Stack>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <ApplicationForm submitButtonText="Create" />
      </Box>
    </Stack>
  );
}
