import {
  Box,
  Button,
  Heading,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { ActionFunction, json } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import Joi from "joi";
import { useEffect } from "react";
import TextInput from "~/components/developer/text-input";
import { validate } from "~/utils/get-validation-errors.server";
import { startPasswordReset } from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  errors?: {
    email?: string;
  };
  fields?: {
    email?: string;
  };
  success: boolean;
};

const validateForm = (form: { email: FormDataEntryValue | null }) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return validate(schema, form);
};

export const action: ActionFunction = async ({ request }) => {
  const { email } = await parseForm(request);
  const { fields, errors } = validateForm({ email });

  if (errors) {
    return json(
      {
        errors,
        fields,
        success: false,
      },
      { status: 400 }
    );
  }

  const { userFound, success } = await startPasswordReset(email);
  // if the user isn't found, return success message to not leak emails
  if (userFound && !success) {
    return json(
      { formLevelError: "Something went wrong, please try again" },
      500
    );
  }

  return json({ success: true, fields });
};

export default function SimpleCard() {
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

    if (actionData?.success) {
      toast({
        title: "Got it!",
        description:
          "If the email address you entered is associated with an account we'll send an email with instructions on how to reset your password.",
        status: "success",
        duration: null,
        isClosable: true,
      });
    }
  }, [actionData]);

  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"}>Reset your password</Heading>
      </Stack>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Form method="post" noValidate reloadDocument>
          <Stack spacing={4}>
            <TextInput
              errorMessage={actionData?.errors?.email}
              defaultValue={actionData?.fields?.email}
              name="email"
              type="email"
              label="Email Address"
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
                Reset Password
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                <ChakraLink
                  as={Link}
                  to="/developer/signin"
                  color={"blue.400"}
                  onClick={() => toast.closeAll()}
                >
                  Back to Sign In
                </ChakraLink>
              </Text>
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Stack>
  );
}
