import { CheckIcon } from "@chakra-ui/icons";
import { Button, Spinner } from "@chakra-ui/react";
import { Form, useTransition } from "@remix-run/react";
import { useState } from "react";

export default function MarkAcknowledgedForm() {
  const transition = useTransition();
  const [formHasBeenSubmitted, setFormHasBeenSubmitted] = useState(false);

  if (
    transition.state === "submitting" ||
    (formHasBeenSubmitted && transition.state === "loading")
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
