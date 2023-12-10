import {
  Alert,
  AlertIcon,
  Code,
  Divider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AdminHeading from "~/components/developer/admin/AdminHeading";
import { BoxComponent } from "~/components/developer/box";
import { db } from "~/utils/db.server";
import { requireAdminRole } from "~/utils/session.server";

export async function loader({ params, request }: LoaderArgs) {
  await requireAdminRole(request);
  const app = await db.application.findUnique({
    where: { id: params.id },
    include: { User: true },
  });
  return json({ app });
}

export default function AdminApplicationView() {
  const { app } = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <AdminHeading>Application Information</AdminHeading>
      <BoxComponent>
        {app === null ? (
          <Alert status="error">
            <AlertIcon />
            App not found
          </Alert>
        ) : (
          <VStack>
            <Text>Name: {app.name}</Text>
            <Text>Status: {app.status}</Text>
            <Text>Link Loads: {app.totalLoads}</Text>
            <Text>Website: {app.website}</Text>
            <Text>
              Created At:{" "}
              {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                new Date(app.createdAt)
              )}
            </Text>
            <Text>
              Updated At:{" "}
              {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                new Date(app.updatedAt)
              )}
            </Text>

            <Divider />

            <Text>
              Owner: {app.User.firstName} {app.User.lastName}
            </Text>
            <Text>Role: {app.User.role}</Text>
            <Text>
              Verified: <Code>{app.User.verified.toString()}</Code>
            </Text>
          </VStack>
        )}
      </BoxComponent>
    </div>
  );
}
