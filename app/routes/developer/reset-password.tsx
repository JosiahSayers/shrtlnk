import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import Joi from "joi";
import TextInput from "~/components/developer/text-input";
import { db } from "~/utils/db.server";
import { validate } from "~/utils/get-validation-errors.server";
import { isPasswordResetValid, resetPassword } from "~/utils/session.server";

interface LoaderData {
  name: string;
  key: string;
}

type ActionData = {
  formLevelError?: string;
  errors?: {
    password?: string;
  };
  fields?: {
    password?: string;
    key?: string;
  };
  success: boolean;
};

const validateForm = (form: {
  password: FormDataEntryValue | null;
  key: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    password: Joi.string().label("Password").required().min(8),
    key: Joi.string().required(),
  });
  return validate(schema, form);
};

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
  const { password, key } = await parseForm(request);
  const { fields, errors } = validateForm({ password, key });

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

  const passwordUpdated = await resetPassword(key, password);
  if (!passwordUpdated) {
    return json({ success: false, fields });
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
        <Form method="post" noValidate reloadDocument>
          <Stack spacing={4}>
            <input
              name="key"
              id="key"
              type="hidden"
              value={loaderData.key ?? actionData?.fields?.key}
            />
            <TextInput
              errorMessage={actionData?.errors?.password}
              defaultValue={actionData?.fields?.password}
              name="password"
              type="password"
              label="New Password"
            />
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
        </Form>
      </Box>
    </Stack>
  );
}
