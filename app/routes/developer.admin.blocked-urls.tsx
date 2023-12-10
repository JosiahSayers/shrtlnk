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
import Pagination, {
  getPaginationData,
} from "~/components/developer/pagination";
import { requireAdminRole } from "~/utils/session.server";

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
  currentPage: number;
  totalPages: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminRole(request);
  const { currentPage, pageSize, skip } = getPaginationData(request);
  const dateString = new URL(request.url).searchParams.get("utc_date");
  const commonQueryOptions = {
    orderBy: { createdAt: "desc" },
    include: { application: { select: { name: true } } },
    skip,
    take: pageSize,
  } as any;
  let urls = [];
  let totalPages: number;

  if (dateString) {
    const date = DateTime.fromFormat(dateString, "M/d/yyyy", { zone: "UTC" })
      .set({ hour: 0 })
      .toJSDate();
    const nextDay = DateTime.fromFormat(dateString, "M/d/yyyy", { zone: "UTC" })
      .plus({ days: 1 })
      .toJSDate();

    date.setUTCHours(0);
    nextDay.setUTCHours(0);

    const query = {
      ...commonQueryOptions,
      where: {
        AND: [{ createdAt: { gte: date } }, { createdAt: { lt: nextDay } }],
      },
    };

    const [urlResults, totalResults] = await db.$transaction([
      db.blockedUrl.findMany(query),
      db.blockedUrl.count({
        ...query,
        take: undefined,
        skip: undefined,
        include: undefined,
      }),
    ]);
    urls = urlResults;
    totalPages = Math.ceil(totalResults / pageSize);
  } else {
    const [urlResults, totalResults] = await db.$transaction([
      db.blockedUrl.findMany(commonQueryOptions),
      db.blockedUrl.count({
        ...commonQueryOptions,
        take: undefined,
        skip: undefined,
        include: undefined,
      }),
    ]);
    urls = urlResults;
    totalPages = Math.ceil(totalResults / pageSize);
  }

  return { urls, date: dateString, currentPage, totalPages };
};

export default function BlockedURLs() {
  const { urls, date, currentPage, totalPages } = useLoaderData<LoaderData>();
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
                  <Td>
                    <Link
                      to={`/developer/admin/application/${url.applicationId}`}
                    >
                      {url.application.name}
                    </Link>
                  </Td>
                  <Td>{url.foundBy}</Td>
                  <Td>{url.url}</Td>
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
