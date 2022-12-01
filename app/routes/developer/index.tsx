import { Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import Card from "~/components/developer/card";
import { getUserSession } from "~/utils/session.server";

export const meta: MetaFunction = () => ({
  title: "Developer Portal - shrtlnk - Simple Link Shortener",
});

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  if (userInfo) {
    return redirect("/developer/applications");
  }
  return null;
};

export default function DeveloperHome() {
  return (
    <Stack spacing="10" maxW="100vw" textAlign="center">
      <Heading fontSize="4xl">Welcome, artisan of the internet!</Heading>
      <Text>
        Shrtlnk strives to be the easiest API to integrate into your project.
        <br />
        Here{"'"}s our onboarding process:
      </Text>
      <Flex
        maxW="100vw"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
      >
        <Card
          title="Create an account"
          text="Click the button below to get started."
          linkUrl="/developer/register"
          linkText="Create Account"
          m="3"
        />
        <Card
          title="Add an application"
          text="You can have as many applications as you would like, we don't like limits here!"
          linkUrl="/developer/signin"
          linkText="Sign In"
          m="3"
        />
        <Card
          title="Use the API"
          text="Each application will be given a private API key, use that to call shrtlnk"
          linkUrl="/developer/documentation"
          linkText="View Documentation"
          m="3"
        />
      </Flex>
    </Stack>
  );
}
