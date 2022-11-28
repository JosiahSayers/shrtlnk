import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Button, Text, Tooltip } from "@chakra-ui/react";
import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function HiddenText({ children }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <>
      <Button
        className="api-key-toggle"
        variant="ghost"
        onClick={() => setHidden(!hidden)}
      >
        {hidden ? <ViewIcon /> : <ViewOffIcon />}
      </Button>
      <Tooltip
        label={`Click the "eye" icon to ${hidden ? "reveal" : "hide"}`}
        aria-label="A tooltip"
      >
        <Text as="span" className="hidden-text">
          {hidden ? "xxxxxxxxxxxxxxxxxxxxxxxxxxx" : children}
        </Text>
      </Tooltip>
    </>
  );
}
