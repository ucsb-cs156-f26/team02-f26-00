import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationIndexPage",
  component: UCSBOrganizationIndexPage,
};

const systemInfoHandler = http.get("/api/systemInfo", () =>
  HttpResponse.json(systemInfoFixtures.showingNeither),
);

export const Empty = {
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.userOnly),
      ),
      systemInfoHandler,
      http.get("/api/UCSBOrganization/all", () => HttpResponse.json([])),
    ],
  },
};

export const ThreeItemsOrdinaryUser = {
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.userOnly),
      ),
      systemInfoHandler,
      http.get("/api/UCSBOrganization/all", () =>
        HttpResponse.json(ucsbOrganizationFixtures.threeOrganizations),
      ),
    ],
  },
};

let adminOrganizations = [];
export const ThreeItemsAdminUser = {
  loaders: [
    () => {
      adminOrganizations = [...ucsbOrganizationFixtures.threeOrganizations];
      return {};
    },
  ],
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),
      systemInfoHandler,
      http.get("/api/UCSBOrganization/all", () =>
        HttpResponse.json(adminOrganizations),
      ),
      http.delete("/api/UCSBOrganization", ({ request }) => {
        const orgCode = new URL(request.url).searchParams.get("orgCode");
        adminOrganizations = adminOrganizations.filter(
          (organization) => organization.orgCode !== orgCode,
        );
        return HttpResponse.json({ message: "Organization deleted" });
      }),
    ],
  },
};
