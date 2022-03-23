import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function HiddenText({ children }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <span onClick={() => setHidden(!hidden)} className="hidden-text">
      {hidden ? "xxxxxxxxxxxxxxxxxxxxxxxxxxx" : children}
    </span>
  );
}
