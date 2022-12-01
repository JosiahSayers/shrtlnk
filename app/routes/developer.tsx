import { Flex, useColorModeValue } from "@chakra-ui/react";
import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import LogRocket from "logrocket";
import NavBar from "~/components/developer/navbar";
import { getUserSession, UserInfo } from "~/utils/session.server";
import ImpersonationBar from "~/components/developer/impersonation-bar";
import { DevPortalContext } from "~/components/developer/dev-portal-context";

interface LoaderData {
  userInfo?: UserInfo;
  useLogRocket: boolean;
}

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://stackpath.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const userInfo = await getUserSession(request);
  const useLogRocket = process.env.NODE_ENV === "production";
  return json<LoaderData>({ userInfo, useLogRocket });
};

export default function DeveloperRoot() {
  const { userInfo, useLogRocket } = useLoaderData<LoaderData>();

  useEffect(() => {
    if (useLogRocket) {
      LogRocket.init("hdaq1j/shrtlnk");
    }
  }, []);

  useEffect(() => {
    if (useLogRocket && userInfo) {
      LogRocket.identify(userInfo.id, {
        name: `${userInfo.firstName} ${userInfo.lastName}`,
        email: userInfo.email,
        role: userInfo.role,
      });
    }
  }, [userInfo]);

  return (
    <DevPortalContext.Provider value={{ userInfo }}>
      <NavBar />
      <ImpersonationBar />
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
    </DevPortalContext.Provider>
  );
}
