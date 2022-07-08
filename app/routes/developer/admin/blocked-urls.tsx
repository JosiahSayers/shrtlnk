import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { BlockedUrl } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import { BoxComponent } from "~/components/developer/box";
import { db } from "~/utils/db.server";

type LoaderData = Array<
  BlockedUrl & {
    createdAt: string;
    linkCreatedAt: string;
    application: {
      name: string;
    };
  }
>;

export const loader: LoaderFunction = async ({ request }) => {
  const dateString = new URL(request.url).searchParams.get("date");
  const date = DateTime.fromJSDate(new Date(dateString ?? "")).toJSDate();
  const nextDay = DateTime.fromJSDate(date).plus({ days: 1 }).toJSDate();
  const commonQueryOptions = {
    orderBy: { createdAt: "desc" },
    include: { application: { select: { name: true } } },
  } as any;
  const urls = await (dateString
    ? db.blockedUrl.findMany({
        ...commonQueryOptions,
        where: {
          AND: [{ createdAt: { gte: date } }, { createdAt: { lt: nextDay } }],
        },
      })
    : db.blockedUrl.findMany(commonQueryOptions));
  return urls;
};

export default function BlockedURLs() {
  const urls = useLoaderData<LoaderData>();
  return (
    <div className="container">
      <AdminHeading>Blocked URLs</AdminHeading>
      <BoxComponent>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Blocked</Th>
                <Th>Link Created</Th>
                <Th>Application</Th>
                <Th>Found By</Th>
                <Th>URL</Th>
              </Tr>
            </Thead>
            <Tbody>
              {urls.map((url) => (
                <Tr key={url.id}>
                  <Td>{new Date(url.createdAt).toLocaleString()}</Td>
                  <Td>{new Date(url.linkCreatedAt).toLocaleString()}</Td>
                  <Td>{url.application.name}</Td>
                  <Td>{url.foundBy}</Td>
                  <Td>{url.url}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </BoxComponent>
    </div>
  );
}
