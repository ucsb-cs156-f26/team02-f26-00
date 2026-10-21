import { http, HttpResponse } from "msw";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

export const Default = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/HelpRequest/post", () =>
          HttpResponse.json({ id: 4, requesterEmail: "new@ucsb.edu" }),
        ),
      ],
    },
  },
};
