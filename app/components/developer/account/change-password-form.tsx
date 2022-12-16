import { Stack, Button, toast } from "@chakra-ui/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import PasswordInput from "~/components/developer/password-input";
import TextInput from "~/components/developer/text-input";

const schema = z.object({
  currentPassword: z.string().min(1, "Current Password is required"),
  newPassword: z
    .string()
    .min(8, "New Password has a minimum length of 8 characters"),
});
export const changePasswordFormValidator = withZod(schema);

interface Props {
  isSubmitting: boolean;
  defaultValues: any;
}

export default function ChangePasswordForm({
  isSubmitting,
  defaultValues,
}: Props) {
  return (
    <ValidatedForm
      method="post"
      validator={changePasswordFormValidator}
      defaultValues={defaultValues}
      noValidate
    >
      <Stack spacing={4}>
        <TextInput
          type="password"
          name="currentPassword"
          label="Current Password"
          isRequired
        />
        <PasswordInput name="newPassword" label="New Password" isRequired />
        <Button
          bg="blue.400"
          color="white"
          type="submit"
          onClick={() => toast.closeAll()}
          _hover={{ bg: "blue.500" }}
          name="_action"
          value="password"
          isLoading={isSubmitting}
        >
          Save
        </Button>
      </Stack>
    </ValidatedForm>
  );
}
