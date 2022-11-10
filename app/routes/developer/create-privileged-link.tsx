import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useEffect } from "react";
import TextInput from "~/components/developer/text-input";
import { validateUrl } from "~/routes";
import { createShrtlnk } from "~/shrtlnk.server";
import { requirePrivilegedRole } from "~/utils/session.server";

interface ActionData {
  fields: {
    url: string;
  };
  errors: {
    url?: string;
  };
  formLevelError?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requirePrivilegedRole(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  await requirePrivilegedRole(request);
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
    link = await createShrtlnk(
      validationResult.value,
      process.env.API_KEY!,
      false
    );
  } catch (e) {
    // throw away unsafe URL error and return generic error
  }

  if (!link) {
    return json({
      errors: {},
      values: { url: validationResult.value },
      formLevelError: "Something went wrong, please try again.",
    });
  }

  return redirect(`/new-link-added?key=${link.key}`);
};

export default function CreatePrivilegedLink() {
  const actionData = useActionData<ActionData>();
  const toast = useToast();
  const { submission } = useTransition();

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
        <Heading fontSize={"4xl"}>Shorten Link</Heading>
        <Text>
          Your account has been marked as a privileged account which allows you
          to create shrtlnks that will skip the ads when loaded. Thanks for
          being awesome!
        </Text>
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
              errorMessage={actionData?.errors?.url}
              defaultValue={actionData?.fields?.url}
              name="url"
              type="text"
              label="URL to shorten"
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
                isLoading={!!submission}
              >
                Create Shrtlnk
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Stack>
  );
}
