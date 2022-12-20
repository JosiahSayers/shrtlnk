import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { sentenceCase } from "change-case";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import MarkAcknowledgedForm from "~/components/developer/admin/feedback/mark-acknowledged-form";
import { BoxComponent } from "~/components/developer/box";
import { db } from "~/utils/db.server";
import { logger } from "~/utils/logger.server";
import { requireAdminRole } from "~/utils/session.server";

interface LoaderData {
  feedback: NonNullable<Awaited<ReturnType<typeof dbCall>>>;
}

interface ActionData {
  success: boolean;
}

async function dbCall(id: string) {
  return db.feedback.findUnique({
    where: { id },
    include: {
      from: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      acknowledgedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
}

export const loader: LoaderFunction = async ({ params }) => {
  const feedback = await dbCall(params.id!);
  if (!feedback) {
    return redirect("/developer/admin/feedback");
  }
  return json({ feedback });
};

export const action: ActionFunction = async ({ request, params }) => {
  const adminUser = await requireAdminRole(request);
  try {
    await db.feedback.update({
      where: { id: params.id },
      data: {
        acknowledgedByUserId: adminUser.id,
        acknowledgedAt: new Date(),
      },
    });
    return json<ActionData>({ success: true });
  } catch (e: any) {
    logger.error(e, {
      msg: "Error acknowledging user feedback",
      admin: adminUser,
      feedbackId: params.id,
    });
    return json<ActionData>({ success: false });
  }
};

export default function FeedbackDetails() {
  const { feedback } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  return (
    <div className="container">
      <AdminHeading>Feedback Details</AdminHeading>
      <VStack>
        <BoxComponent width="90%" padding="0">
          <HStack
            width="100%"
            backgroundColor="gray.200"
            padding="3"
            borderTopRadius="md"
            marginBottom="0"
          >
            <Button
              onClick={() => navigate("/developer/admin/feedback")}
              marginRight="6"
            >
              <ArrowBackIcon fontSize="2xl" />
            </Button>

            {!feedback.acknowledgedBy && <MarkAcknowledgedForm />}

            {feedback.acknowledgedBy && feedback.acknowledgedAt && (
              <Text>
                Acknowledged by {feedback.acknowledgedBy.firstName}{" "}
                {feedback.acknowledgedBy.lastName} on{" "}
                {new Date(feedback.acknowledgedAt).toLocaleString()}
              </Text>
            )}
          </HStack>
          <Box padding="2rem" textAlign="left">
            <Text fontWeight="bold">
              From: {feedback.from.firstName} {feedback.from.lastName}
            </Text>
            <Text fontWeight="bold">Type: {sentenceCase(feedback.type)}</Text>
            <Text fontWeight="bold">
              Received: {new Date(feedback.createdAt).toLocaleString()}
            </Text>
            <br />
            <Text>{feedback.text}</Text>
          </Box>
        </BoxComponent>
      </VStack>
    </div>
  );
}
