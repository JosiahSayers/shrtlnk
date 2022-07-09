import {
  Heading,
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
import Link from "~/components/developer/Link";

type LoaderData = {
  urls: Array<
    BlockedUrl & {
      createdAt: string;
      linkCreatedAt: string;
      application: {
        name: string;
      };
    }
  >;
  date?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const dateString = new URL(request.url).searchParams.get("date");
  const commonQueryOptions = {
    orderBy: { createdAt: "desc" },
    include: { application: { select: { name: true } } },
  } as any;
  let urls = [];

  if (dateString) {
    const date = DateTime.fromFormat(dateString, "M/d/yyyy")
      .set({ hour: 0 })
      .toJSDate();
    const nextDay = DateTime.fromFormat(dateString, "M/d/yyyy")
      .plus({ days: 1 })
      .toJSDate();

    date.setUTCHours(0);
    nextDay.setUTCHours(0);

    urls = await db.blockedUrl.findMany({
      ...commonQueryOptions,
      where: {
        AND: [{ createdAt: { gte: date } }, { createdAt: { lt: nextDay } }],
      },
    });
  } else {
    urls = await db.blockedUrl.findMany(commonQueryOptions);
  }

  return { urls, date: dateString };
};

export default function BlockedURLs() {
  const { urls, date } = useLoaderData<LoaderData>();
  return (
    <div className="container">
      <AdminHeading>Blocked URLs</AdminHeading>
      {date && (
        <Heading as="h3" fontSize="xl" fontWeight="semibold">
          Filtered to date: {date} (
          <Link to="/developer/admin/blocked-urls">show all</Link>)
        </Heading>
      )}
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
