import { Form } from "@remix-run/react";
import { useUserInfo } from "~/components/developer/dev-portal-context";

export default function ImpersonationBar() {
  const userInfo = useUserInfo();

  if (!userInfo?.impersonator) {
    return null;
  }

  const { firstName, lastName } = userInfo.impersonator;

  return (
    <div className="bg-warning d-flex justify-content-center align-items-center">
      <p className="mb-0 mr-3">
        {firstName} {lastName} impersonating!
      </p>
      <Form method="post" action="/developer/admin/impersonate">
        <button
          type="submit"
          name="_action"
          id="_action"
          value="stop"
          className="btn btn-link"
        >
          Stop Impersonating
        </button>
      </Form>
    </div>
  );
}
