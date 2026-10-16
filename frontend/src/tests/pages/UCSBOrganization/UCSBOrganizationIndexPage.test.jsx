import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockedNavigate,
}));

const testId = "UCSBOrganizationTable";
const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/ucsborganization"]}>
        <UCSBOrganizationIndexPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("UCSBOrganizationIndexPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupUser = (user) => {
    axiosMock.reset();
    mockedNavigate.mockClear();
    axiosMock.onGet("/api/currentUser").reply(200, user);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("shows all organizations without actions for an ordinary user", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/UCSBOrganization/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ORG001");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("ORG002");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("ORG003");
    expect(screen.queryByText("Create UCSBOrganization")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("shows create and row actions for an admin", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/UCSBOrganization/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("ORG002");
    expect(screen.getByText("Create UCSBOrganization")).toHaveAttribute(
      "href",
      "/ucsborganization/create",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Edit-button`),
    );
    expect(mockedNavigate).toHaveBeenCalledWith(
      "/ucsborganization/edit/ORG002",
    );
  });

  test("deletes a row and refreshes the list", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);
    let organizations = [...ucsbOrganizationFixtures.threeOrganizations];
    axiosMock
      .onGet("/api/UCSBOrganization/all")
      .reply(() => [200, organizations]);
    axiosMock.onDelete("/api/UCSBOrganization").reply((config) => {
      organizations = organizations.filter(
        (organization) => organization.orgCode !== config.params.orgCode,
      );
      return [200, { message: "Organization deleted" }];
    });

    renderPage();
    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-1-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "ORG002" });
    await waitFor(() =>
      expect(screen.queryByText("ORG002")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("ORG001")).toBeInTheDocument();
    expect(screen.getByText("ORG003")).toBeInTheDocument();
  });
});
