import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

interface Props extends BoxProps {
  children: React.ReactChild;
}

export default function BoxComponent({ children, ...props }: Props) {
  return (
    <Box
      rounded={"lg"}
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      p={8}
      {...props}
    >
      {children}
    </Box>
  );
}
