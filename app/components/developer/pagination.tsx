import { Button, Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate, useSearchParams } from "@remix-run/react";
import { safelyParseInt } from "~/utils/safely-parse";

export const getPaginationData = (request: Request) => {
  const currentPage =
    safelyParseInt(new URL(request.url).searchParams.get("page") ?? "1") ?? 1;
  const defaultPageSize = 15;
  const pageSize =
    safelyParseInt(
      new URL(request.url).searchParams.get("pageSize") ?? `${defaultPageSize}`
    ) ?? defaultPageSize;
  const skip = (currentPage - 1) * pageSize;

  return { currentPage, pageSize, skip };
};

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange?: (newPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const defaultOnPageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    navigate(`${location.pathname}?${searchParams}`);
  };
  const pageChangeCallback = onPageChange ?? defaultOnPageChange;

  return (
    <Flex alignItems="center" justifyContent="space-around" mx="40" my="4">
      <Button
        onClick={() => pageChangeCallback(currentPage - 1)}
        disabled={currentPage < 2}
      >
        Back
      </Button>
      <Text>
        Page {currentPage} of {totalPages}
      </Text>
      <Button
        onClick={() => pageChangeCallback(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </Flex>
  );
}
