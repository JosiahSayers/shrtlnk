import { Button, useToast } from "@chakra-ui/react";
import { useIsSubmitting } from "remix-validated-form";

interface Props {
  text?: string;
  action?: string;
}

export default function SubmitButton({ text = "Submit", action }: Props) {
  const toast = useToast();
  const isSubmitting = useIsSubmitting();

  return (
    <Button
      bg={"blue.400"}
      color={"white"}
      type="submit"
      onClick={() => toast.closeAll()}
      _hover={{
        bg: "blue.500",
      }}
      isLoading={isSubmitting}
      name={action ? "_action" : undefined}
      value={action}
    >
      {text}
    </Button>
  );
}
