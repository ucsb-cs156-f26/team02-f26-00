import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

export const Default = {
  args: {
    storybook: true,
    storybookOrgCode: ucsbOrganizationFixtures.oneOrganization.orgCode,
  },
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),
      http.get("/api/systemInfo", () =>
        HttpResponse.json(systemInfoFixtures.showingNeither),
      ),
      http.get("/api/UCSBOrganization", () =>
        HttpResponse.json(ucsbOrganizationFixtures.oneOrganization),
      ),
      http.put("/api/UCSBOrganization", async ({ request }) =>
        HttpResponse.json(await request.json()),
      ),
    ],
  },
};
