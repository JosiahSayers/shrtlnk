import {
  Link as ChakraLink,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { CleanLinksLog } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import { BoxComponent } from "~/components/developer/box";
import Pagination, {
  getPaginationData,
} from "~/components/developer/pagination";
import { db } from "~/utils/db.server";

type LoaderData = {
  logs: Array<
    CleanLinksLog & {
      duration: string;
      createdAt: string;
      completedAt: string | null;
    }
  >;
  currentPage: number;
  totalPages: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { currentPage, pageSize, skip } = getPaginationData(request);
  const logs = await db.cleanLinksLog.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  });
  const mappedLogs = logs.map((log) => {
    const created = DateTime.fromJSDate(log.createdAt);
    const completed = DateTime.fromJSDate(log.completedAt ?? new Date());
    const diff = completed.diff(created, "seconds").toObject();
    return {
      ...log,
      duration: log.completedAt
        ? diff.seconds?.toFixed(2) + "s"
        : "Still running...",
    };
  });
  const totalLogs = await db.cleanLinksLog.count();
  const totalPages = Math.ceil(totalLogs / pageSize);

  return {
    logs: mappedLogs,
    currentPage,
    totalPages,
  };
};

export default function CleanedLinks() {
  const { logs, currentPage, totalPages } = useLoaderData<LoaderData>();

  const getDateForUrl = (date: string) =>
    DateTime.fromISO(date, {
      zone: "UTC",
    }).toFormat("M/d/yyyy");

  const getBackgroundColor = (log: CleanLinksLog) => {
    if (log.status === "failure") {
      return "red.100";
    }

    if (log.totalThreatsFound) {
      return "teal.100";
    }

    return "";
  }

  return (
    <div className="container">
      <AdminHeading>Link Cleaning Log</AdminHeading>
      <BoxComponent>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Time to complete</Th>
                <Th>Links cleaned</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs.map((log) => (
                <Tr
                  key={log.id}
                  backgroundColor={getBackgroundColor(log)}
                >
                  <Td>
                    <ChakraLink
                      as={Link}
                      to={`/developer/admin/blocked-urls?utc_date=${getDateForUrl(
                        log.createdAt
                      )}`}
                    >
                      {new Date(log.createdAt).toLocaleString()}
                    </ChakraLink>
                  </Td>
                  <Td>{log.duration}</Td>
                  <Td>{log.totalThreatsFound}</Td>
                  <Td>{log.status}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </BoxComponent>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
