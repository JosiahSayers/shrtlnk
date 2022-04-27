import {
  Box,
  Code,
  Container,
  Heading,
  List,
  ListItem,
  Stack,
  Text,
} from "@chakra-ui/react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { BoxComponent } from "~/components/developer/box";

export default function Documentation() {
  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={"3xl"}>Shrtlnk API Documentation</Heading>
        <Text color={"gray.600"} fontSize={"xl"}>
          The API consists of a single <Code>POST</Code> endpoint that takes in
          the URL you would like to shorten.
        </Text>
      </Stack>

      <Container maxW={"6xl"} mt={10} textAlign="left">
        <List>
          <ListItem>
            <Text as="span" fontWeight="bold">
              URL:
            </Text>{" "}
            <Code>https://shrtlnk.dev/api/v2/link</Code>
          </ListItem>

          <ListItem>
            <Text as="span" fontWeight="bold">
              Required Headers:
            </Text>{" "}
            <Text as="pre" ml="5">
              <Code>
                {
                  "api-key: Your API key\nAccept: application/json\nContent-Type: application/json"
                }
              </Code>
            </Text>
          </ListItem>

          <ListItem>
            <Text mt={5} fontWeight="bold">
              Request Body
            </Text>
            <BoxComponent p={0} mt={2} overflow="hidden" maxWidth="83vw">
              <Code
                textAlign="left"
                width="100%"
                height="100%"
                m={0}
                p={0}
                display="block"
              >
                <Text
                  as={SyntaxHighlighter}
                  p={3}
                  language="javascript"
                  style={vs2015}
                  showLineNumbers
                >
                  {
                    "{\n  url: string // The URL that you would like to be shortened.\n}"
                  }
                </Text>
              </Code>
            </BoxComponent>
          </ListItem>

          <ListItem>
            <Text mt={5} fontWeight="bold">
              201 - Successful Response Body
            </Text>
            <BoxComponent p={0} mt={2} overflow="hidden" maxWidth="83vw">
              <Code
                textAlign="left"
                width="100%"
                height="100%"
                m={0}
                p={0}
                display="block"
              >
                <Text
                  as={SyntaxHighlighter}
                  p={3}
                  language="javascript"
                  style={vs2015}
                  showLineNumbers
                >
                  {
                    "{\n  url: string // The URL that was passed in the request.\n  key: string // 6-digit key that can be used to reference the shortend URL.\n  shrtlnk: string // The fully qualified shortened URL that you can return to the user.\n}"
                  }
                </Text>
              </Code>
            </BoxComponent>
          </ListItem>

          <ListItem>
            <Text mt={5} fontWeight="bold">
              400/500 - Error Response Body
            </Text>
            <BoxComponent p={0} mt={2} overflow="hidden" maxWidth="83vw">
              <Code
                textAlign="left"
                width="100%"
                height="100%"
                m={0}
                p={0}
                display="block"
              >
                <Text
                  as={SyntaxHighlighter}
                  p={3}
                  language="javascript"
                  style={vs2015}
                  showLineNumbers
                >
                  {
                    "{\n  message: string // A message describing the error and/or how to fix it.\n}"
                  }
                </Text>
              </Code>
            </BoxComponent>
          </ListItem>
        </List>
      </Container>
    </Box>
  );
}
