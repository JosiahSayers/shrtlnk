import {
  BoxProps,
  Button,
  Container,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { BoxComponent } from "./box";

interface CardProps extends BoxProps {
  title: string;
  text: string;
  linkUrl: string;
  linkText: string;
}

export default function Card({
  title,
  text,
  linkUrl,
  linkText,
  ...props
}: CardProps) {
  return (
    <BoxComponent w="80" h="60" maxW="100vw" {...props}>
      <Flex
        justifyContent="space-between"
        direction="column"
        h="100%"
        flexWrap="wrap"
      >
        <Container m="0" p="0" w="100%">
          <Heading fontSize="xl" mb="3">
            {title}
          </Heading>
          <Text>{text}</Text>
        </Container>
        <Button
          as={Link}
          to={linkUrl}
          fontWeight={600}
          color="white"
          bg="blue.400"
          _hover={{ bg: "blue.300", color: "white" }}
        >
          {linkText}
        </Button>
      </Flex>
    </BoxComponent>
  );
}
