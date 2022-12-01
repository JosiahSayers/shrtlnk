import { createContext, useContext } from "react";
import { UserInfo } from "~/utils/session.server";

interface DevPortalContext {
  userInfo?: UserInfo;
}

export const DevPortalContext = createContext<DevPortalContext>({});

export const useUserInfo = () => {
  const context = useContext(DevPortalContext);
  return context.userInfo;
};
