import { Flex, useColorModeValue } from "@chakra-ui/react";
import { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import NavBar from "~/components/developer/navbar";
import { getUserSession, UserInfo } from "~/utils/session.server";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  return { userInfo };
};

export default function DeveloperRoot() {
  const { userInfo } = useLoaderData<{ userInfo?: UserInfo }>();

  return (
    <>
      <NavBar userInfo={userInfo} />
      {userInfo?.impersonator && (
        <div className="bg-warning d-flex justify-content-center align-items-center">
          <p className="mb-0 mr-3">
            {userInfo.impersonator.firstName} {userInfo.impersonator.lastName}{" "}
            impersonating!
          </p>
          <Form method="post" action="/developer/admin/impersonate">
            <button
              type="submit"
              name="_action"
              id="_action"
              value="stop"
              className="btn btn-link"
            >
              Stop Impersonating
            </button>
          </Form>
        </div>
      )}
      <Flex
        minH="calc(100vh - 60px)"
        w="100vw"
        alignItems="center"
        justifyContent="center"
        bg={useColorModeValue("gray.50", "gray.800")}
        direction="column"
        textAlign="center"
      >
        <Outlet />
      </Flex>
    </>
  );
}
