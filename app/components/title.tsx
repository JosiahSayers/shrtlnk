import { Link } from "@remix-run/react";
import { Link as ChakraLink } from "@chakra-ui/react";

export default function WebsiteTitle() {
  return (
    <h1 className="title">
      <ChakraLink as={Link} to="/" textDecorationLine="none">
        <span>S</span>
        <span>H</span>
        <span>R</span>
        <span>T</span>
        <span>L</span>
        <span>N</span>
        <span>K</span>
      </ChakraLink>
    </h1>
  );
}
