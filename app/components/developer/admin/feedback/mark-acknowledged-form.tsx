import { CheckIcon } from "@chakra-ui/icons";
import { Button, Spinner } from "@chakra-ui/react";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";

export default function MarkAcknowledgedForm() {
  const navigation = useNavigation();
  const [formHasBeenSubmitted, setFormHasBeenSubmitted] = useState(false);

  if (
    navigation.state === "submitting" ||
    (formHasBeenSubmitted && navigation.state === "loading")
  ) {
    return (
      <Button disabled>
        <Spinner />
      </Button>
    );
  }

  return (
    <Form method="post">
      <Button
        type="submit"
        onClick={() => setFormHasBeenSubmitted(true)}
        id="mark-as-acknowledged"
      >
        <CheckIcon fontSize="2xl" />
      </Button>
    </Form>
  );
}
