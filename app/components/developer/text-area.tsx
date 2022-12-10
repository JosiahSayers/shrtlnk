import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";

interface Props extends FormControlProps {
  errorMessage?: string;
  defaultValue?: string;
  label: string;
  name: string;
  id?: string;
  helperText?: string;
}

export default function TextArea({
  errorMessage,
  defaultValue,
  label,
  name,
  id = name,
  helperText,
  ...props
}: Props) {
  return (
    <FormControl id={id} isInvalid={!!errorMessage} {...props}>
      <FormLabel>{label}</FormLabel>
      <Textarea name={name} defaultValue={defaultValue} />
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
