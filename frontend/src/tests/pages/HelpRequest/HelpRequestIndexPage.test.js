import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HelpRequestIndexPage, {
  helpRequestDeleteParams,
} from "main/pages/HelpRequest/HelpRequestIndexPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { useCurrentUser } from "main/utils/currentUser";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

jest.mock("main/utils/currentUser", () => ({ useCurrentUser: jest.fn() }));
jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
  useBackendMutation: jest.fn(),
}));

const mutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useCurrentUser.mockReturnValue({ root: { role: "ROLE_USER" } });
  useBackend.mockReturnValue({
    data: helpRequestFixtures.threeHelpRequests,
    error: null,
    status: "success",
  });
  useBackendMutation.mockReturnValue({ mutate, isSuccess: false });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <HelpRequestIndexPage />
    </MemoryRouter>,
  );

test("displays all HelpRequests from the backend", () => {
  renderPage();
  expect(useBackend).toHaveBeenCalledWith(
    ["/api/HelpRequest/all"],
    { method: "GET", url: "/api/HelpRequest/all" },
    [],
  );
  expect(screen.getByText("student3@ucsb.edu")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
});

test("admin sees create and delete actions", () => {
  useCurrentUser.mockReturnValue({ root: { role: "ROLE_ADMIN" } });
  renderPage();
  expect(screen.getByRole("link", { name: "Create HelpRequest" })).toHaveAttribute(
    "href", "/helprequest/create",
  );
  fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
  expect(mutate).toHaveBeenCalledWith(1);
});

test("passes correct DELETE params", () => {
  expect(helpRequestDeleteParams(17)).toEqual({
    url: "/api/HelpRequest",
    method: "DELETE",
    params: { id: 17 },
  });
});

test("displays a backend error", () => {
  useBackend.mockReturnValue({ data: [], error: "Server unavailable", status: "error" });
  renderPage();
  expect(screen.getByRole("alert")).toHaveTextContent("Server unavailable");
});
