import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import Joi from "joi";
import { useEffect, useState } from "react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import TextInput from "~/components/developer/text-input";
import { validate } from "~/utils/get-validation-errors.server";
import {
  changePassword,
  createUserSession,
  requireUserSession,
  updateName,
} from "~/utils/session.server";

type LoaderData = {
  firstName?: string;
  lastName?: string;
  formType?: "name" | "password";
};

type ActionData = {
  formType?: "name" | "password";
  formLevelError?: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    formType?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
  fields?: {
    firstName?: string;
    lastName?: string;
    formType?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
};

const validateNameForm = (form: {
  firstName: FormDataEntryValue | null;
  lastName: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    firstName: Joi.string().label("First Name").required(),
    lastName: Joi.string().label("Last Name").required(),
  });
  return validate<{ firstName: string; lastName: string }>(schema, form);
};

const validatePasswordForm = (form: {
  currentPassword: FormDataEntryValue | null;
  newPassword: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    currentPassword: Joi.string().label("Current Password").required(),
    newPassword: Joi.string().label("New Password").required().min(8),
  });
  return validate<{
    currentPassword: string;
    newPassword: string;
  }>(schema, form);
};

export const loader: LoaderFunction = async ({ request }) => {
  const { firstName, lastName } = await requireUserSession(request);
  const formType = new URL(request.url).searchParams.get("formType");
  return { firstName, lastName, formType };
};

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
  const formData = await request.formData();
  const formType = formData.get("_action");

  if (formType === "name") {
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const { fields, errors } = validateNameForm({ firstName, lastName });
    if (errors) {
      return json({ errors, fields, formType: "name" }, 400);
    }
    const newUser = await updateName(
      fields.firstName,
      fields.lastName,
      userInfo.id
    );
    return createUserSession(newUser, "/developer/applications");
  }

  if (formType === "password") {
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const { fields, errors } = validatePasswordForm({
      currentPassword,
      newPassword,
    });
    if (errors) {
      return json({ errors, fields, formType: "password" }, 400);
    }
    try {
      const newUser = await changePassword(
        fields.currentPassword,
        fields.newPassword,
        userInfo.id
      );
      if (!newUser) {
        return json({
          formLevelError: "Something went wrong, please try again.",
          formType: "password",
        });
      }
      return redirect("/developer/applications");
    } catch (e: any) {
      if (e.message === "password mismatch") {
        return json({
          errors: {
            currentPassword:
              "The password you entered does not match your current password",
          },
          fields,
          formType: "password",
        });
      }
    }
  }
};

export default function Account() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const formType = loaderData?.formType || actionData?.formType || "name";
  const firstName = loaderData?.firstName || actionData?.fields?.firstName;
  const lastName = loaderData?.lastName || actionData?.fields?.lastName;

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
  }, [actionData, formType]);

  enum Forms {
    "name",
    "password",
  }

  const handleTabClick = (newIndex: number) => {
    document.location.href = `/developer/account?formType=${Forms[newIndex]}`;
  };

  return (
    <Box
      rounded="lg"
      bg={useColorModeValue("white", "gray.700")}
      boxShadow="lg"
      p={8}
      textAlign="left"
    >
      <Tabs index={Forms[formType]} onChange={handleTabClick}>
        <TabList>
          <Tab>Edit Name</Tab>
          <Tab>Change Password</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Form method="post" noValidate>
              <Stack spacing={4}>
                <TextInput
                  errorMessage={actionData?.errors?.firstName}
                  defaultValue={firstName}
                  name="firstName"
                  label="First Name"
                  isRequired
                />
                <TextInput
                  errorMessage={actionData?.errors?.lastName}
                  defaultValue={lastName}
                  name="lastName"
                  label="Last Name"
                  isRequired
                />
                <Button
                  bg="blue.400"
                  color="white"
                  type="submit"
                  onClick={() => toast.closeAll()}
                  _hover={{ bg: "blue.500" }}
                  name="_action"
                  value="name"
                >
                  Save
                </Button>
              </Stack>
            </Form>
          </TabPanel>
          <TabPanel>
            <Form method="post" noValidate>
              <Stack spacing={4}>
                <TextInput
                  errorMessage={actionData?.errors?.currentPassword}
                  type="password"
                  name="currentPassword"
                  label="Current Password"
                  isRequired
                />
                <FormControl
                  id="newPassword"
                  isInvalid={!!actionData?.errors?.newPassword}
                  isRequired
                >
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      defaultValue={actionData?.fields?.newPassword}
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
                  {actionData?.errors?.newPassword && (
                    <FormErrorMessage>
                      {actionData.errors.newPassword}
                    </FormErrorMessage>
                  )}
                </FormControl>
                <Button
                  bg="blue.400"
                  color="white"
                  type="submit"
                  onClick={() => toast.closeAll()}
                  _hover={{ bg: "blue.500" }}
                  name="_action"
                  value="password"
                >
                  Save
                </Button>
              </Stack>
            </Form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
