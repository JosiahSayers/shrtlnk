import { Prisma } from "@prisma/client";
import Joi from "joi";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  Link,
} from "remix";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link as ChakraLink,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { validate } from "~/utils/get-validation-errors.server";
import {
  createUserSession,
  getUserSession,
  register,
  RegisterForm,
} from "~/utils/session.server";
import TextInput from "~/components/developer/TextInput";

type ActionData = {
  formLevelError?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  fields?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

const validateForm = (form: any) => {
  const schema = Joi.object({
    firstName: Joi.string().label("First Name").required(),
    lastName: Joi.string().label("Last Name").required(),
    email: Joi.string().email().label("Email").required(),
    password: Joi.string().label("Password").required().min(8),
  });
  return validate<RegisterForm>(schema, form);
};

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  if (userInfo) {
    return redirect("/developer/applications");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const form = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const { fields, errors } = validateForm(form);
  if (errors) {
    return json({ errors, fields }, 400);
  }
  try {
    const newUser = await register(fields);
    if (newUser) {
      return createUserSession(newUser, "/developer/applications");
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return json({ formLevelError: "Email is already in use.", fields });
    }
  }

  return json({
    formLevelError:
      "Sorry about this, but something unexpected happened on our end. Please submit the form again.",
  });
};

export default function SignupCard() {
  const actionData = useActionData<ActionData>();
  const [showPassword, setShowPassword] = useState(false);
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
    <Flex
      minH={"calc(100vh - 56px)"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
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
          <Form method="post" noValidate>
            <Stack spacing={4}>
              <HStack>
                <Box>
                  <TextInput
                    errorMessage={actionData?.errors?.firstName}
                    defaultValue={actionData?.fields?.firstName}
                    name="firstName"
                    type="firstName"
                    label="First Name"
                    isRequired
                  />
                </Box>
                <Box>
                  <TextInput
                    errorMessage={actionData?.errors?.lastName}
                    defaultValue={actionData?.fields?.lastName}
                    name="lastName"
                    type="lastName"
                    label="Last Name"
                    isRequired
                  />
                </Box>
              </HStack>
              <TextInput
                errorMessage={actionData?.errors?.email}
                defaultValue={actionData?.fields?.email}
                name="email"
                type="email"
                label="Email Address"
                isRequired
              />
              <FormControl
                id="password"
                isInvalid={!!actionData?.errors?.password}
                isRequired
              >
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    defaultValue={actionData?.fields?.password}
                  />
                  <InputRightElement h={"full"}>
                    <Button
                      variant={"ghost"}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {actionData?.errors?.password && (
                  <FormErrorMessage>
                    {actionData.errors.password}
                  </FormErrorMessage>
                )}
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  loadingText="Submitting"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type="submit"
                  onClick={() => toast.closeAll()}
                >
                  Sign up
                </Button>
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
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
}
