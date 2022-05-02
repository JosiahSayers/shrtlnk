import {
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import { Application } from "@prisma/client";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import { deleteApp } from "~/application.server";
import { BoxComponent } from "~/components/developer/box";
import { requireUserOwnsApplication } from "~/utils/authorization.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { app } = await requireUserOwnsApplication(request, params.appId);
  return app;
};

export const action: ActionFunction = async ({ request, params }) => {
  const {
    app: { id },
  } = await requireUserOwnsApplication(request, params.appId);
  await deleteApp(id);
  return redirect("/developer/applications");
};

export default function DeleteApp() {
  const app = useLoaderData<Application>();
  const { state } = useTransition();

  return (
    <BoxComponent>
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Heading fontSize="3xl" mb="6">
          Are you sure that you want to delete this?
        </Heading>
        <Text>All applications using this API key will no longer work.</Text>
        <Text mb="3">
          All shrtlnks that were created through this application will not be
          deleted and will remain functional.
        </Text>

        <Text mb="5">
          <Text as="strong">App: </Text>
          {app.name}
        </Text>
        <Form method="post">
          <input type="hidden" name="appId" value={app.id} />
          <Flex alignItems="center" justifyContent="space-around">
            <Button
              bg="red.400"
              color="white"
              type="submit"
              _hover={{ bg: "red.500" }}
              mr="3"
              isLoading={state !== "idle"}
            >
              Delete
            </Button>
            <ChakraLink as={Link} to="/developer/applications">
              Cancel
            </ChakraLink>
          </Flex>
        </Form>
      </Flex>
    </BoxComponent>
  );
}
