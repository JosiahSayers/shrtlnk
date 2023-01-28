import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useActionData, useTransition } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import TextInput from "~/components/developer/text-input";
import { createShrtlnk, DuplicateKeyError } from "~/shrtlnk.server";
import { logger } from "~/utils/logger.server";
import { requirePrivilegedRole } from "~/utils/session.server";

interface ActionData {
  fields: z.infer<typeof schema>;
  formLevelError?: string;
}

const schema = z.object({
  url: z.string().url(),
  customShort: z.string()
    .max(20, { message: 'Custom URLs have a max length of 20 characters' })
    .optional()
    .refine(
      val => !val || /^[a-zA-Z0-9_-]*$/g.test(val),
      { message: 'Only the following characters are allowed: a-z, A-Z, 0-9, _, -' }
    ),
});
const validator = withZod(schema);

export const loader: LoaderFunction = async ({ request }) => {
  await requirePrivilegedRole(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  await requirePrivilegedRole(request);
  const validationResult = await validator.validate(await request.formData());

  if (validationResult.error) {
    return validationError(
      validationResult.error,
      validationResult.submittedData
    );
  }

  let link;
  try {
    link = await createShrtlnk(
      validationResult.data.url,
      process.env.API_KEY!,
      false,
      validationResult.data.customShort
    );
  } catch (e) {
    logger.error("Failed creating privileged link", e);
    if (e instanceof DuplicateKeyError) {
      return validationError({
          fieldErrors: {
            customShort: 'This key already exists, please choose another'
          }
        },
        validationResult.submittedData
      );
    }
    // throw away unsafe URL error and return generic error
  }

  if (!link) {
    return json({
      errors: {},
      values: { 
        url: validationResult.data.url,
        customShort: validationResult.data.customShort
      },
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
        <ValidatedForm
          method="post"
          validator={validator}
          defaultValues={actionData?.fields}
          noValidate
        >
          <Stack spacing={4}>
            <TextInput name="url" type="text" label="URL to shorten" />
            <TextInput name="customShort" type="text" label="Custom Shortened URL (optional)" />
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
        </ValidatedForm>
      </Box>
    </Stack>
  );
}
