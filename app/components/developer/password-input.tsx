import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Button,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useState } from "react";
import { useField } from "remix-validated-form";

interface Props extends FormControlProps {
  label: string;
  name: string;
  id?: string;
  helperText?: string;
}

export default function PasswordInput({
  label,
  name,
  id = name,
  helperText,
  ...props
}: Props) {
  const { error, getInputProps } = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl id={id} isInvalid={!!error} {...props}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <InputGroup>
        <Input type={showPassword ? "text" : "password"} {...getInputProps()} />
        <InputRightElement h={"full"}>
          <Button
            variant={"ghost"}
            onClick={() => setShowPassword((showPassword) => !showPassword)}
          >
            {showPassword ? <ViewIcon /> : <ViewOffIcon />}
          </Button>
        </InputRightElement>
      </InputGroup>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
