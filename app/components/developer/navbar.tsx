import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  IconButton,
  Link as ChakraLink,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { useMemo } from "react";
import { useUserInfo } from "~/components/developer/dev-portal-context";
import type { UserInfo } from "~/utils/session.server";

export default function NavBar() {
  const userInfo = useUserInfo();
  const { isOpen, onToggle } = useDisclosure();
  const currentNavItems = useMemo(
    () => navItems(userInfo),
    [userInfo, userInfo?.impersonator]
  );

  const DesktopNav = ({ navItems }: { navItems: NavItem[] }) => {
    const linkColor = useColorModeValue("gray.600", "gray.200");
    const linkHoverColor = useColorModeValue("gray.800", "white");

    return (
      <Stack direction={"row"} spacing={4}>
        {navItems.map((navItem) => (
          <Box key={navItem.label}>
            <ChakraLink
              as={Link}
              p={2}
              fontSize={"sm"}
              fontWeight={500}
              color={linkColor}
              _hover={{
                textDecoration: "none",
                color: linkHoverColor,
              }}
              to={navItem.href}
              prefetch="intent"
            >
              {navItem.label}
            </ChakraLink>
          </Box>
        ))}
      </Stack>
    );
  };

  const MobileNav = ({ navItems }: { navItems: NavItem[] }) => {
    return (
      <Stack
        bg={useColorModeValue("white", "gray.800")}
        p={4}
        display={{ md: "none" }}
      >
        {navItems.map((navItem) => (
          <MobileNavItem key={navItem.label} {...navItem} />
        ))}
      </Stack>
    );
  };

  const MobileNavItem = ({ label, href }: NavItem) => {
    return (
      <>
        <Flex
          py={2}
          as={Link}
          to={href}
          justify={"space-between"}
          align={"center"}
          _hover={{
            textDecoration: "none",
          }}
          onClick={onToggle}
        >
          <Text
            fontWeight={600}
            color={useColorModeValue("gray.600", "gray.200")}
          >
            {label}
          </Text>
        </Flex>

        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        ></Stack>
      </>
    );
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <ChakraLink
            as={Link}
            textAlign={useBreakpointValue({ base: "center", md: "left" })}
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
            to="/"
          >
            shrtlnk
          </ChakraLink>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav navItems={currentNavItems} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          {userInfo ? (
            <>
              {" "}
              <Button
                as={Link}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={400}
                variant={"link"}
                to={"/developer/account"}
                prefetch="intent"
              >
                Hey there, {userInfo.firstName}
              </Button>
              <Button
                as={Link}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={400}
                variant={"link"}
                to={"/developer/signout"}
                reloadDocument
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              {" "}
              <Button
                as={Link}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={400}
                variant={"link"}
                to={"/developer/signin"}
                prefetch="intent"
              >
                Sign In
              </Button>
              <Button
                as={Link}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"blue.400"}
                to={"/developer/register"}
                _hover={{
                  bg: "blue.300",
                  color: "white",
                }}
                prefetch="intent"
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav navItems={currentNavItems} />
      </Collapse>
    </Box>
  );
}

interface NavItem {
  label: string;
  subLabel?: string;
  href: string;
}

const navItems = (userInfo?: UserInfo): NavItem[] => {
  const items = [
    {
      label: "Dev Portal",
      href: "/developer",
    },
    {
      label: "Documentation",
      href: "/developer/documentation",
    },
  ];

  if (userInfo) {
    items.push({
      label: "My Applications",
      href: "/developer/applications",
    });
  }

  if (userInfo?.role === "Admin") {
    items.push({
      label: "Admin Dashboard",
      href: "/developer/admin",
    });
  }

  if (userInfo?.role === "Admin" || userInfo?.role === "Privileged") {
    items.push({
      label: "Shorten Link (without ads)",
      href: "/developer/create-privileged-link",
    });
  }
  return items;
};
