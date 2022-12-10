import { HStack, Select as ChakraSelect } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  label: string;
  name: string;
  id?: string;
  values: string[];
  defaultValue?: string;
  renderOption?: (value: string) => string;
}

export default function Select({
  label,
  name,
  id = name,
  values,
  defaultValue,
  renderOption,
}: Props) {
  const [value, setValue] = useState(defaultValue ?? values[0]);
  return (
    <HStack>
      <label htmlFor="user">{label}</label>
      <ChakraSelect
        name={name}
        id={id}
        bg="white"
        onChange={(event) => {
          setValue(event.target.value);
        }}
        value={value}
      >
        {values.map((v) => (
          <option value={v} key={v}>
            {renderOption?.(v) ?? v}
          </option>
        ))}
      </ChakraSelect>
    </HStack>
  );
}
