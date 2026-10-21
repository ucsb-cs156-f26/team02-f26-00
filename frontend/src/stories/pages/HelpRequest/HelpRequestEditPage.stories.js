import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "pages/HelpRequest/HelpRequestEditPage",
  component: HelpRequestEditPage,
};

export const Default = {
  render: () => (
    <MemoryRouter initialEntries={["/helprequest/edit/1"]}>
      <Routes>
        <Route path="/helprequest/edit/:id" element={<HelpRequestEditPage />} />
      </Routes>
    </MemoryRouter>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get("/api/HelpRequest", () =>
          HttpResponse.json(helpRequestFixtures.oneHelpRequest),
        ),
        http.put("/api/HelpRequest", () => HttpResponse.json({})),
      ],
    },
  },
};
