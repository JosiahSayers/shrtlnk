import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Feedback } from "@prisma/client";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { sentenceCase } from "change-case";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import TruncatedText from "~/components/developer/admin/truncated-text";
import { BoxComponent } from "~/components/developer/box";
import Pagination, {
  getPaginationData,
} from "~/components/developer/pagination";
import { db } from "~/utils/db.server";
import { logger } from "~/utils/logger.server";
import { requireAdminRole } from "~/utils/session.server";

interface LoaderData {
  messages: Awaited<ReturnType<typeof dbCall>>[0];
  totalUnreadMessages: number;
  paginationProps: {
    currentPage: number;
    totalPages: number;
  };
}

async function dbCall(skip: number, pageSize: number) {
  try {
    return db.$transaction([
      db.feedback.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          from: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      db.feedback.count({ where: { acknowledgedAt: null } }),
      db.feedback.count(),
    ]);
  } catch (e: any) {
    logger.error(e, { msg: "Error fetching user feedback" });
    throw e;
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminRole(request);
  const { currentPage, pageSize, skip } = getPaginationData(request);
  const [messages, totalUnread, totalMessages] = await dbCall(skip, pageSize);
  const totalPages = Math.ceil(totalMessages / pageSize);
  return json<LoaderData>({
    messages,
    totalUnreadMessages: totalUnread,
    paginationProps: { currentPage, totalPages },
  });
};

export default function Feedback() {
  const { messages, paginationProps, totalUnreadMessages } =
    useLoaderData<LoaderData>();
  const navigate = useNavigate();

  const isAcknowledged = (message: typeof messages[number]) =>
    message.acknowledgedAt && message.acknowledgedByUserId;

  return (
    <div className="container">
      <AdminHeading>User Feedback ({totalUnreadMessages} Unread)</AdminHeading>
      <BoxComponent>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>From</Th>
                <Th>Message</Th>
                <Th>Type</Th>
                <Th>Received</Th>
              </Tr>
            </Thead>
            <Tbody>
              {messages.map((message) => (
                <Tr
                  key={message.id}
                  fontWeight={isAcknowledged(message) ? "normal" : "bold"}
                  backgroundColor={isAcknowledged(message) ? "" : "gray.50"}
                  onClick={() => navigate(message.id)}
                  cursor="pointer"
                  _hover={{
                    background: "gray.100",
                  }}
                >
                  <Td>
                    {message.from.firstName} {message.from.lastName}
                  </Td>
                  <Td>
                    <TruncatedText>{message.text}</TruncatedText>
                  </Td>
                  <Td>{sentenceCase(message.type)}</Td>
                  <Td>{new Date(message.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </BoxComponent>
      <Pagination {...paginationProps} />
    </div>
  );
}
