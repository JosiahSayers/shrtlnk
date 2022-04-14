import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export const BoxComponent: React.FC<BoxProps> = ({ children, ...props }) => {
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
};
