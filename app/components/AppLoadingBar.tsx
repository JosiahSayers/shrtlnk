import { Progress } from "@chakra-ui/react";
import { useNavigation } from "@remix-run/react";
import { useState } from "react";

export default function AppLoadingBar() {
  const { state } = useNavigation();
  const [display, setDisplay] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<number | null>(null);

  if (state !== "idle" && !timeoutRef) {
    const ref: any = setTimeout(() => setDisplay(true), 200);
    setTimeoutRef(ref);
  } else if (state === "idle" && timeoutRef) {
    setDisplay(false);
    clearInterval(timeoutRef);
    setTimeoutRef(null);
  }

  if (!display) {
    return null;
  }

  return <Progress zIndex={1000} size="xs" isIndeterminate />;
}
