import { Text, Tooltip } from "@chakra-ui/react";
import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function HiddenText({ children }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <Tooltip
      label={`Click to ${hidden ? "reveal" : "hide"}`}
      aria-label="A tooltip"
    >
      <Text
        as="span"
        onClick={() => setHidden(!hidden)}
        className="hidden-text"
      >
        {hidden ? "xxxxxxxxxxxxxxxxxxxxxxxxxxx" : children}
      </Text>
    </Tooltip>
  );
}
