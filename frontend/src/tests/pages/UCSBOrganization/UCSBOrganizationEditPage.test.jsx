import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter
        initialEntries={["/previous", "/ucsborganization/edit/ORG001"]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/previous" element={<div>Previous destination</div>} />
          <Route
            path="/ucsborganization/edit/:id"
            element={<UCSBOrganizationEditPage />}
          />
          <Route
            path="/ucsborganization"
            element={<div>Index destination</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("UCSBOrganizationEditPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/UCSBOrganization", { params: { orgCode: "ORG001" } })
      .reply(200, ucsbOrganizationFixtures.oneOrganization);
  });

  test("loads the record into the form and keeps its code read-only", async () => {
    renderPage();

    expect(await screen.findByLabelText("Organization Code")).toHaveValue(
      "ORG001",
    );
    expect(screen.getByLabelText("Organization Code")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByLabelText("Short Organization Name")).toHaveValue(
      "Gaucho Gaming",
    );
    expect(screen.getByLabelText("Organization Name")).toHaveValue(
      "Gaucho Gaming Club",
    );
    expect(screen.getByLabelText("Inactive")).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
    expect(axiosMock.history.get).toContainEqual(
      expect.objectContaining({
        url: "/api/UCSBOrganization",
        params: { orgCode: "ORG001" },
      }),
    );
  });

  test("saves valid changes and returns to the index page", async () => {
    axiosMock.onPut("/api/UCSBOrganization").reply(200, {
      orgCode: "ORG001",
      orgTranslationShort: "Gaming",
      orgTranslation: "Gaucho Gaming Society",
      inactive: true,
    });
    renderPage();
    await screen.findByLabelText("Organization Code");

    fireEvent.change(screen.getByLabelText("Short Organization Name"), {
      target: { value: "Gaming" },
    });
    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: "Gaucho Gaming Society" },
    });
    fireEvent.click(screen.getByLabelText("Inactive"));
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => expect(axiosMock.history.put).toHaveLength(1));
    expect(axiosMock.history.put[0].params).toEqual({ orgCode: "ORG001" });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      orgCode: "ORG001",
      orgTranslationShort: "Gaming",
      orgTranslation: "Gaucho Gaming Society",
      inactive: true,
    });
    expect(await screen.findByText("Index destination")).toBeInTheDocument();
  });

  test("shows validation errors without saving", async () => {
    renderPage();
    await screen.findByLabelText("Organization Code");

    fireEvent.change(screen.getByLabelText("Short Organization Name"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(
      await screen.findByText("Short organization name is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(screen.getByText("Edit UCSBOrganization")).toBeInTheDocument();
  });

  test("cancel goes back without saving", async () => {
    renderPage();
    await screen.findByLabelText("Organization Code");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByText("Previous destination")).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
  });
});
