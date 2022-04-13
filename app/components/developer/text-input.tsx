import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormControlProps,
} from "@chakra-ui/react";

interface Props extends FormControlProps {
  errorMessage?: string;
  defaultValue?: string;
  label: string;
  name: string;
  type?: HTMLInputElement["type"];
  id?: string;
}

export default function TextInput({
  errorMessage,
  defaultValue,
  label,
  name,
  type = "text",
  id = name,
  ...props
}: Props) {
  return (
    <FormControl id={id} isInvalid={!!errorMessage} {...props}>
      <FormLabel>{label}</FormLabel>
      <Input type={type} name={name} defaultValue={defaultValue} />
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  );
}
