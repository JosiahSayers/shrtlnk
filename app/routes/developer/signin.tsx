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
import {
  Form,
  Link,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import Joi from "joi";
import { useEffect } from "react";
import TextInput from "~/components/developer/text-input";
import { validate } from "~/utils/get-validation-errors.server";
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

const validateForm = (form: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  return validate(schema, form);
};

export const action: ActionFunction = async ({ request }) => {
  const { email, password, redirectTo } = await parseForm(request);

  const { fields, errors } = validateForm({ email, password });

  if (errors) {
    return json(
      {
        errors,
        fields,
      },
      { status: 400 }
    );
  }

  const user = await signin(fields);
  if (user) {
    return createUserSession(
      user,
      (redirectTo as string) || "/developer/applications"
    );
  }

  return json(
    {
      formLevelError: "Could not log you in with these credentials",
      fields: fields,
    },
    { status: 400 }
  );
};

export default function SimpleCard() {
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
        <Form method="post" noValidate>
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <Stack spacing={4}>
            <TextInput
              errorMessage={actionData?.errors?.email}
              defaultValue={actionData?.fields?.email}
              name="email"
              type="email"
              label="Email Address"
            />
            <TextInput
              errorMessage={actionData?.errors?.password}
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
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Stack>
  );
}
