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
import { db } from "~/utils/db.server";

type LoaderData = Array<
  CleanLinksLog & {
    duration: string;
  }
>;

export const loader: LoaderFunction = async () => {
  const logs = await db.cleanLinksLog.findMany({
    orderBy: { createdAt: "desc" },
  });
  return logs.map((log) => {
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
};

export default function CleanedLinks() {
  const logs = useLoaderData<LoaderData>();
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
                  backgroundColor={
                    log.status === "failure"
                      ? "red.100"
                      : log.totalThreatsFound
                      ? "teal.100"
                      : "Background"
                  }
                >
                  <Td>
                    <ChakraLink
                      as={Link}
                      to={`/developer/admin/blocked-urls?date=${new Date(
                        log.createdAt
                      ).toLocaleDateString()}`}
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
    </div>
  );
}
