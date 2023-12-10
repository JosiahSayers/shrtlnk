import { Link, useLocation } from "@remix-run/react";
import { Badge } from "@chakra-ui/react";

interface Props {
  href: string;
  title: string;
  notificationCount?: number;
}

export default function AdminLink({ href, title, notificationCount }: Props) {
  const currentPath = useLocation().pathname.split("/developer/admin")[1];
  let className = "nav-link";

  if (currentPath === href || currentPath === `/${href}`) {
    className += " font-weight-bold";
  }

  return (
    <Link to={href} className={className}>
      {title}
      {notificationCount ? (
        <Badge colorScheme="red" ml="2" fontSize="md">
          {notificationCount}
        </Badge>
      ) : null}
    </Link>
  );
}
