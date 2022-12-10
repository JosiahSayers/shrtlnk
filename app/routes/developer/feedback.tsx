import {
  Stack,
  Heading,
  Box,
  useColorModeValue,
  Button,
  toast,
  Text,
} from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { LoaderFunction, json, ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import TextArea from "~/components/developer/text-area";
import { requireUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireUserSession(request);
  return json(session);
};

export const action: ActionFunction = async ({ request }) => {
  const session = await requireUserSession(request);
  const { feedback } = await parseForm(request);
  return json({ feedback, session });
};

export default function Feedback() {
  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"} textAlign={"center"}>
          Send Feedback
        </Heading>
        <Text>
          Your feedback is always appreciated. Let us know how we can make
          shrtlnk better!
        </Text>
      </Stack>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Form method="post" noValidate>
          <Stack spacing={4}>
            <TextArea
              defaultValue=""
              name="feedback"
              label="Feedback"
              isRequired
            />
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                type="submit"
                onClick={() => toast.closeAll()}
                // isLoading={!!submission}
              >
                Send Feedback
              </Button>
            </Stack>
          </Stack>
        </Form>
      </Box>
    </Stack>
  );
}
