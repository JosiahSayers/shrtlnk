import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import PasswordInput from "~/components/developer/password-input";
import { db } from "~/utils/db.server";
import { isPasswordResetValid, resetPassword } from "~/utils/session.server";

interface LoaderData {
  name: string;
  key: string;
}

type ActionData = {
  formLevelError?: string;
  fields?: z.infer<typeof schema>;
  success: boolean;
};

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  key: z.string(),
});
const validator = withZod(schema);

export const loader: LoaderFunction = async ({ request }) => {
  const passwordResetKey = new URL(request.url).searchParams.get("key");
  if (!passwordResetKey) {
    return redirect("/developer/signin");
  }

  const data = await db.passwordReset.findUnique({
    where: { key: passwordResetKey },
    include: { user: true },
  });

  if (!isPasswordResetValid(data)) {
    return redirect("/developer/signin?password-reset=invalid");
  }

  return json<LoaderData>({
    name: data.user.firstName,
    key: passwordResetKey,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const validationResult = await validator.validate(await request.formData());
  if (validationResult.error) {
    return validationError(
      validationResult.error,
      validationResult.submittedData
    );
  }
  const { password, key } = validationResult.data;

  const passwordUpdated = await resetPassword(key, password);
  if (!passwordUpdated) {
    return json({ success: false, fields: validationResult.submittedData });
  }

  return redirect("/developer/signin?password-reset=success");
};

export default function SimpleCard() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const { submission } = useTransition();

  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"} mb="6">
          Reset your password
        </Heading>
        <Text>
          Hey {loaderData.name}, submit the form below to change your password.
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
          reloadDocument
        >
          <Stack spacing={4}>
            <input
              name="key"
              id="key"
              type="hidden"
              value={loaderData.key ?? actionData?.fields?.key}
            />
            <PasswordInput name="password" label="New Password" />
            <Stack spacing={10}>
              <Button
                bg={"blue.400"}
                color={"white"}
                type="submit"
                _hover={{
                  bg: "blue.500",
                }}
                isLoading={!!submission}
              >
                Reset Password
              </Button>
            </Stack>
          </Stack>
        </ValidatedForm>
      </Box>
    </Stack>
  );
}
