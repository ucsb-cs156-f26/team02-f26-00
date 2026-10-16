import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationCreatePage",
  component: UCSBOrganizationCreatePage,
};

export const Default = {
  args: { storybook: true },
  parameters: {
    msw: [
      http.get("/api/currentUser", () =>
        HttpResponse.json(apiCurrentUserFixtures.adminUser),
      ),
      http.get("/api/systemInfo", () =>
        HttpResponse.json(systemInfoFixtures.showingNeither),
      ),
      http.post("/api/UCSBOrganization/post", ({ request }) => {
        const params = new URL(request.url).searchParams;
        return HttpResponse.json({
          orgCode: params.get("orgCode"),
          orgTranslationShort: params.get("orgTranslationShort"),
          orgTranslation: params.get("orgTranslation"),
          inactive: params.get("inactive") === "true",
        });
      }),
    ],
  },
};
