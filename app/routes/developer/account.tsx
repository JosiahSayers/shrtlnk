import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect } from "react";
import { validationError } from "remix-validated-form";
import ChangeNameForm, {
  changeNameFormValidator,
} from "~/components/developer/account/change-name-form";
import ChangePasswordForm, {
  changePasswordFormValidator,
} from "~/components/developer/account/change-password-form";
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
  fields?: {
    firstName?: string;
    lastName?: string;
    formType?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const { firstName, lastName } = await requireUserSession(request);
  const formType = new URL(request.url).searchParams.get("formType");
  return { firstName, lastName, formType };
};

export const action: ActionFunction = async ({ request }) => {
  const userInfo = await requireUserSession(request);
  const form = await request.formData();
  const action = form.get("_action");

  if (action === "name") {
    const validationResult = await changeNameFormValidator.validate(form);
    if (validationResult.error) {
      return validationError(
        validationResult.error,
        validationResult.submittedData
      );
    }
    const newUser = await updateName(
      validationResult.data.firstName,
      validationResult.data.lastName,
      userInfo.id
    );
    return createUserSession(newUser, "/developer/applications");
  }

  if (action === "password") {
    const validationResult = await changePasswordFormValidator.validate(form);
    if (validationResult.error) {
      return validationError(
        validationResult.error,
        validationResult.submittedData
      );
    }
    try {
      const updatedUser = await changePassword(
        validationResult.data.currentPassword,
        validationResult.data.newPassword,
        userInfo.id
      );
      if (!updatedUser) {
        return json({
          formLevelError: "Something went wrong, please try again.",
          formType: "password",
        });
      }
      return redirect("/developer/applications");
    } catch (e: any) {
      if (e.message === "password mismatch") {
        return json({
          formLevelError:
            "The password you entered does not match your current password",
          fields: validationResult.submittedData,
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
  const { submission } = useTransition();

  const isSubmittingName = submission?.formData.get("_action") === "name";
  const isSubmittingPassword =
    submission?.formData.get("_action") === "password";

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
            <ChangeNameForm
              isSubmitting={isSubmittingName}
              defaultValues={{ firstName, lastName }}
            />
          </TabPanel>
          <TabPanel>
            <ChangePasswordForm
              isSubmitting={isSubmittingPassword}
              defaultValues={actionData?.fields}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
