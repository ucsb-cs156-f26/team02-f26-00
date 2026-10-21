import { http, HttpResponse } from "msw";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage,
};

export const WithRecords = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/HelpRequest/all", () =>
          HttpResponse.json(helpRequestFixtures.threeHelpRequests),
        ),
        http.delete("/api/HelpRequest", () => HttpResponse.json({})),
      ],
    },
  },
};

export const Empty = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/HelpRequest/all", () => HttpResponse.json([])),
      ],
    },
  },
};
