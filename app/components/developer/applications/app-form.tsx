import { Stack } from "@chakra-ui/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import SubmitButton from "~/components/developer/submit-button";
import TextInput from "~/components/developer/text-input";

interface Props {
  submitButtonText: string;
  defaultValues?: Partial<z.infer<typeof schema>>;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().optional().default(""),
});
export const applicationFormValidator = withZod(schema);

export default function ApplicationForm({
  submitButtonText,
  defaultValues,
}: Props) {
  return (
    <ValidatedForm
      method="post"
      validator={applicationFormValidator}
      defaultValues={defaultValues}
      noValidate
    >
      <Stack spacing={4}>
        <TextInput
          name="name"
          type="name"
          label="Application Name"
          isRequired
        />
        <TextInput
          name="website"
          type="website"
          label="URL of Application"
          helperText="If this is a mobile app, put the URL to the app store page. Otherwise, leave blank for now and fill in later."
        />
        <Stack spacing={10}>
          <SubmitButton text={submitButtonText} />
        </Stack>
      </Stack>
    </ValidatedForm>
  );
}
