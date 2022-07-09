import { Link as ChakraLink } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
import { RemixLinkProps } from "@remix-run/react/components";

export default function Link({ to, children }: RemixLinkProps) {
  return (
    <ChakraLink as={RemixLink} to={to} prefetch="intent">
      {children}
    </ChakraLink>
  );
}
