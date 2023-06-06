import {
  Stack,
  Heading,
  Box,
  useColorModeValue,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { parseForm } from "@formdata-helper/remix";
import { FeedbackType } from "@prisma/client";
import { LoaderFunction, json, ActionFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { sentenceCase } from "change-case";
import { useEffect } from "react";
import Select from "~/components/developer/select";
import TextArea from "~/components/developer/text-area";
import { db } from "~/utils/db.server";
import { newFeedbackEmail } from "~/utils/email.server";
import { logger } from "~/utils/logger.server";
import { requireUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserSession(request);
  const feedbackTypes = Object.values(FeedbackType);
  return json({ feedbackTypes });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await requireUserSession(request);
  const { feedback, feedbackType } = await parseForm(request);
  if (!feedback || !Object.values(FeedbackType).includes(feedbackType)) {
    return json({ error: "Feedback is required to submit this form" });
  }

  try {
    await db.feedback.create({
      data: {
        fromId: session.id,
        text: feedback,
        type: feedbackType,
      },
    });
    await newFeedbackEmail(`${session.firstName} ${session.lastName}`);
    return json({ success: true });
  } catch (e: any) {
    logger.error(e, { msg: "failed to create feedback record" });
    return json({ error: "Something went wrong, please try again." });
  }
};

export default function Feedback() {
  const { feedbackTypes } = useLoaderData();
  const actionData = useActionData();
  const toast = useToast();
  const navigate = useNavigate();
  const { submission } = useTransition();

  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    if (actionData?.success) {
      toast({
        title: "We got it!",
        description:
          "Your feedback has been recorded. Thank you for helping us improve this service for everyone.",
        status: "success",
        duration: null,
        isClosable: true,
      });
      navigate("/developer");
    }
  }, [actionData]);

  return (
    <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
      <Stack align={"center"}>
        <Heading fontSize={"4xl"} textAlign={"center"}>
          Feedback Form
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
            <Select
              label="Type"
              name="feedbackType"
              values={feedbackTypes}
              renderOption={sentenceCase}
            />
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
                isLoading={!!submission}
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
