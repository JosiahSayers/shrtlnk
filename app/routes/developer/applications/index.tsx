import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Heading,
  Link as ChakraLink,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { LinksFunction } from "@remix-run/react/routeModules";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { getApplicationsWithCounts } from "~/application.server";
import { BoxComponent } from "~/components/developer/box";
import HiddenText from "~/components/developer/hidden-text";
import styles from "~/styles/developer/applications.css";
import { requireUserSession } from "~/utils/session.server";

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUserSession>>;
  applications: Awaited<ReturnType<typeof getApplicationsWithCounts>>;
};

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  return { user, applications: await getApplicationsWithCounts(user.id) };
};

export default function Applications() {
  const { applications, user } = useLoaderData<LoaderData>();

  return (
    <>
      <Heading size="2xl" mb="5">
        Your Applications
      </Heading>

      {applications.length > 0 && (
        <Button
          as={Link}
          className="btn btn-light"
          role="button"
          id="add-app"
          to="/developer/applications/new"
          alignSelf="flex-end"
          mr="5vw"
        >
          Add an application
        </Button>
      )}

      {applications.length < 1 && (
        <Alert status="info" w="60vw" textAlign="left">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Hi, {user.firstName}.</AlertTitle>
            <AlertDescription display="block">
              It looks like you haven{"'"}t added an application yet.{" "}
              <ChakraLink
                as={Link}
                to="/developer/applications/new"
                color="teal.500"
              >
                Click here
              </ChakraLink>{" "}
              to get started!
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {applications.map((app) => (
        <BoxComponent key={app.id} w="90vw" m="3">
          <Heading mb="4" size="lg" overflowWrap="anywhere">
            {app.name}
          </Heading>
          <Flex w="100%" h="100%" justifyContent="space-around" flexWrap="wrap">
            <List mb="3" textAlign="left">
              <ListItem overflowWrap="anywhere">
                <Text as="span" fontWeight="bold">
                  Status:
                </Text>{" "}
                {app.status}
              </ListItem>

              <ListItem>
                <Text as="span" fontWeight="bold">
                  API Key:
                </Text>{" "}
                <HiddenText>{app.apiKey}</HiddenText>
              </ListItem>

              <ListItem>
                <Text as="span" fontWeight="bold">
                  Created On:
                </Text>{" "}
                {Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
                  new Date(app.createdAt)
                )}
              </ListItem>

              <ListItem>
                <Text as="span" fontWeight="bold">
                  Website:
                </Text>{" "}
                {app.website ? (
                  <ChakraLink
                    href={app.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    overflowWrap="anywhere"
                    textDecoration="underline"
                  >
                    {app.website}
                  </ChakraLink>
                ) : (
                  "No website added yet"
                )}
              </ListItem>

              <ListItem>
                <Text as="span" fontWeight="bold">
                  Shrtlnks created:
                </Text>{" "}
                {app.shrtlnksCreated}
              </ListItem>

              <ListItem>
                <Text as="span" fontWeight="bold">
                  Shrtlnks loaded:
                </Text>{" "}
                {app.shrtlnkLoads} time{app.shrtlnkLoads === 1 ? "" : "s"}
              </ListItem>

              <ListItem>
                <Text as="span" fontWeight="bold">
                  Unsafe URLs detected and blocked from this application:
                </Text>{" "}
                {app.blockedUrls}
              </ListItem>
            </List>

            <Flex alignItems="center" justifyContent="center">
              <Button
                color="white"
                bg="blue.400"
                _hover={{ bg: "blue.300", color: "white" }}
                as={Link}
                to={`/developer/applications/${app.id}/edit`}
                m="2"
              >
                Edit
              </Button>
              <Button
                as={Link}
                color="white"
                bg="red.400"
                _hover={{ bg: "red.300", color: "white" }}
                to={`/developer/applications/${app.id}/delete`}
                m="2"
              >
                Delete
              </Button>
            </Flex>
          </Flex>
        </BoxComponent>
      ))}
    </>
  );
}
