import { Heading } from "@chakra-ui/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AdminHeading({ children }: Props) {
  return <Heading style={{ marginBottom: "1rem" }}>{children}</Heading>;
}
