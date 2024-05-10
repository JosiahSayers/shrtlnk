import { FormLabel, HStack, Select } from "@chakra-ui/react";
import { LoaderFunction } from "@remix-run/node";
import { useState } from "react";
import ShrtlnkCounts from "~/components/developer/admin/charts/ShrtlnkCounts";
import ShrtlnkStats from "~/components/developer/admin/charts/ShrtlnkStats";
import UserCounts from "~/components/developer/admin/charts/UserCounts";
import UserStats from "~/components/developer/admin/charts/UserStats";
import { requireAdminRole } from "~/utils/session.server";

export const defaultDaysToQuery = 10;

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminRole(request);
  return null;
};

export default function AdminIndex() {
  const [daysToQuery, setDaysToQuery] = useState(defaultDaysToQuery);

  return (
    <div className="container">
      <HStack justify="flex-end" mb="1rem">
        <FormLabel htmlFor="days">Days to show:</FormLabel>
        <Select
          id="days"
          bg="white"
          w={75}
          onChange={(event) => setDaysToQuery(parseInt(event.target.value))}
          value={daysToQuery}
        >
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
            <option key={day}>{day}</option>
          ))}
        </Select>
      </HStack>

      <ShrtlnkStats daysToQuery={daysToQuery} />
      <UserStats daysToQuery={daysToQuery} />
      <ShrtlnkCounts />
      <UserCounts />
    </div>
  );
}
