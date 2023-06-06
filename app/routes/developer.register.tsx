import {
  Box,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Prisma } from "@prisma/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import PasswordInput from "~/components/developer/password-input";
import SubmitButton from "~/components/developer/submit-button";
import TextInput from "~/components/developer/text-input";
import {
  createUserSession,
  getUserSession,
  register,
} from "~/utils/session.server";

type ActionData = {
  formLevelError?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
  fields?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };
};

const schema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().min(1, "Email is required").email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
const validator = withZod(schema);
export type RegisterForm = z.infer<typeof schema>;

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  if (userInfo) {
    return redirect("/developer/applications");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const validationResult = await validator.validate(await request.formData());

  if (validationResult.error) {
    return validationError(
      validationResult.error,
      validationResult.submittedData
    );
  }

  try {
    const newUser = await register(validationResult.data);
    if (newUser) {
      return createUserSession(newUser, "/developer/applications");
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return json({
        formLevelError: "Email is already in use.",
        fields: validationResult.submittedData,
      });
    }
  }

  return json({
    formLevelError:
      "Sorry about this, but something unexpected happened on our end. Please submit the form again.",
    fields: validationResult.submittedData,
  });
};

export default function SignupCard() {
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
        <Heading fontSize={"4xl"} textAlign={"center"}>
          Sign up for an account
        </Heading>
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
            <HStack alignItems="flex-start">
              <Box>
                <TextInput
                  name="firstName"
                  type="firstName"
                  label="First Name"
                  isRequired
                />
              </Box>
              <Box>
                <TextInput
                  name="lastName"
                  type="lastName"
                  label="Last Name"
                  isRequired
                />
              </Box>
            </HStack>
            <TextInput
              name="email"
              type="email"
              label="Email Address"
              isRequired
            />
            <PasswordInput label="Password" name="password" isRequired />
            <Stack spacing={10} pt={2}>
              <SubmitButton text="Sign up" />
            </Stack>
            <Stack pt={6}>
              <Text align={"center"}>
                Already a user?{" "}
                <ChakraLink
                  as={Link}
                  to="/developer/signin"
                  color={"blue.400"}
                  onClick={() => toast.closeAll()}
                >
                  Sign in
                </ChakraLink>
              </Text>
            </Stack>
          </Stack>
        </ValidatedForm>
      </Box>
    </Stack>
  );
}
