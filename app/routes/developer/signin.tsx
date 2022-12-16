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
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import TextInput from "~/components/developer/text-input";
import { createUserSession, signin } from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  errors?: {
    email?: string;
    password?: string;
  };
  fields?: {
    email?: string;
    password?: string;
  };
};

const schema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z.string().min(1, "Password is required"),
  redirectTo: z.string().optional(),
});
const validator = withZod(schema);

export const loader: LoaderFunction = async ({ request }) => {
  const passwordResetStatus = new URL(request.url).searchParams.get(
    "password-reset"
  );
  return json({ passwordResetStatus });
};

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());

  if (result.error) {
    return validationError(result.error, result.submittedData);
  }

  const user = await signin(result.data);
  if (user) {
    return createUserSession(
      user,
      result.data.redirectTo || "/developer/applications"
    );
  }

  return json(
    {
      formLevelError: "Could not log you in with these credentials",
      fields: result.submittedData,
    },
    { status: 400 }
  );
};

export default function SignIn() {
  const { passwordResetStatus } = useLoaderData();
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
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

    if (passwordResetStatus === "invalid") {
      toast({
        title: "Invalid Password Reset Link",
        description: "This password reset link is invalid",
        status: "error",
        duration: null,
        isClosable: true,
      });
    }

    if (passwordResetStatus === "success") {
      toast({
        title: "Password Reset",
        description:
          "Your password has been reset. You can now log in with your new password.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [actionData]);

  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"}>Sign in to your account</Heading>
      </Stack>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          reloadDocument
        >
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <Stack spacing={4}>
            <TextInput
              defaultValue={actionData?.fields?.email}
              name="email"
              type="email"
              label="Email Address"
            />
            <TextInput
              defaultValue={actionData?.fields?.password}
              name="password"
              type="password"
              label="Password"
            />
            <Stack spacing={10}>
              <Stack
                direction={{ base: "column", sm: "row" }}
                align={"start"}
                justify={"space-between"}
              ></Stack>
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
                Sign in
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Need an account?{" "}
                <ChakraLink
                  as={Link}
                  to="/developer/register"
                  color={"blue.400"}
                  onClick={() => toast.closeAll()}
                >
                  Sign up
                </ChakraLink>
              </Text>

              <Text align={"center"}>
                Forgot your password?{" "}
                <ChakraLink
                  as={Link}
                  to="/developer/request-password-reset"
                  color={"blue.400"}
                  onClick={() => toast.closeAll()}
                >
                  Reset it
                </ChakraLink>
              </Text>
            </Stack>
          </Stack>
        </ValidatedForm>
      </Box>
    </Stack>
  );
}
