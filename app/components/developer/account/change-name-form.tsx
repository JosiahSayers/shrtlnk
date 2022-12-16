import { Stack } from "@chakra-ui/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import SubmitButton from "~/components/developer/submit-button";
import TextInput from "~/components/developer/text-input";

interface Props {
  defaultValues: any;
}

const schema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
});
export const changeNameFormValidator = withZod(schema);

export default function ChangeNameForm({ defaultValues }: Props) {
  return (
    <ValidatedForm
      method="post"
      validator={changeNameFormValidator}
      defaultValues={defaultValues}
      noValidate
    >
      <Stack spacing={4}>
        <TextInput name="firstName" label="First Name" isRequired />
        <TextInput name="lastName" label="Last Name" isRequired />
        <SubmitButton text="Save" action="name" />
      </Stack>
    </ValidatedForm>
  );
}
