import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const testId = "UCSBOrganizationTable";
const expectedHeaders = [
  "Organization Code",
  "Short Organization Name",
  "Organization Name",
  "Inactive",
];

const renderTable = (organizations, currentUser) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <UCSBOrganizationTable
          organizations={organizations}
          currentUser={currentUser}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("UCSBOrganizationTable", () => {
  beforeEach(() => mockedNavigate.mockClear());

  test("renders an empty table with all organization headers", () => {
    renderTable([], currentUserFixtures.userOnly);

    expectedHeaders.forEach((header) =>
      expect(screen.getByText(header)).toBeInTheDocument(),
    );
    expect(screen.queryByTestId(`${testId}-row-0`)).not.toBeInTheDocument();
  });

  test("shows every field and no actions for an ordinary user", () => {
    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.userOnly,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ORG001");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("Gaucho Gaming");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("Gaucho Gaming Club");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("No");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-inactive`),
    ).toHaveTextContent("Yes");
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("shows admin actions and edits the selected organization", () => {
    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.adminUser,
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-1-col-Edit-button`,
    );
    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-1-col-Delete-button`,
    );
    expect(editButton).toHaveClass("btn-primary");
    expect(deleteButton).toHaveClass("btn-danger");

    fireEvent.click(editButton);
    expect(mockedNavigate).toHaveBeenCalledWith(
      "/ucsborganization/edit/ORG002",
    );
  });

  test("deletes the selected organization using its code", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/UCSBOrganization")
      .reply(200, { message: "Organization deleted" });

    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.adminUser,
    );
    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "ORG002" });
    axiosMock.restore();
  });
});
