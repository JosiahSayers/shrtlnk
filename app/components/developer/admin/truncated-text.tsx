import { Text } from "@chakra-ui/react";

interface Props {
  children: string;
  length?: number;
}

export default function TruncatedText({ children, length = 50 }: Props) {
  const needsTruncated = children.length > 50;
  const displayText = needsTruncated
    ? `${children.substring(0, length)}...`
    : children;
  return <Text>{displayText}</Text>;
}
