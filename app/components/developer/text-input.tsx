import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useField } from "remix-validated-form";

interface Props extends FormControlProps {
  label: string;
  name: string;
  type?: HTMLInputElement["type"];
  id?: string;
  helperText?: string;
}

export default function TextInput({
  label,
  name,
  type = "text",
  id = name,
  helperText,
  ...props
}: Props) {
  const { error, getInputProps } = useField(name);

  return (
    <FormControl id={id} isInvalid={!!error} {...props}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input type={type} {...getInputProps()} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
