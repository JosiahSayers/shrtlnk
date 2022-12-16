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
import { ActionFunction, json } from "@remix-run/node";
import { Link, useActionData, useTransition } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import TextInput from "~/components/developer/text-input";
import { startPasswordReset } from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  fields?: z.infer<typeof schema>;
  success: boolean;
};

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
});
const validator = withZod(schema);

export const action: ActionFunction = async ({ request }) => {
  const validationResult = await validator.validate(await request.formData());
  if (validationResult.error) {
    return validationError(
      validationResult.error,
      validationResult.submittedData
    );
  }

  const { success } = await startPasswordReset(validationResult.data.email);
  if (!success) {
    return json(
      { formLevelError: "Something went wrong, please try again" },
      500
    );
  }

  return json({ success: true, fields: validationResult.submittedData });
};

export default function RequestPasswordReset() {
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
        <ValidatedForm
          method="post"
          validator={validator}
          defaultValues={actionData?.fields}
          noValidate
          reloadDocument
        >
          <Stack spacing={4}>
            <TextInput name="email" type="email" label="Email Address" />
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
        </ValidatedForm>
      </Box>
    </Stack>
  );
}
