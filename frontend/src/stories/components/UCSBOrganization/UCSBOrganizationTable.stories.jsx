import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBOrganization/UCSBOrganizationTable",
  component: UCSBOrganizationTable,
};

export const Empty = {
  args: {
    organizations: [],
    currentUser: currentUserFixtures.userOnly,
  },
};

export const ThreeItemsOrdinaryUser = {
  args: {
    organizations: ucsbOrganizationFixtures.threeOrganizations,
    currentUser: currentUserFixtures.userOnly,
  },
};

export const ThreeItemsAdminUser = {
  args: {
    organizations: ucsbOrganizationFixtures.threeOrganizations,
    currentUser: currentUserFixtures.adminUser,
  },
  parameters: {
    msw: [
      http.delete("/api/UCSBOrganization", () =>
        HttpResponse.json({ message: "Organization deleted" }),
      ),
    ],
  },
};
