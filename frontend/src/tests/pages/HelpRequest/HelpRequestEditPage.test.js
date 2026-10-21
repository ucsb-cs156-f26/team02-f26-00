import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import HelpRequestEditPage, {
  helpRequestPutParams,
} from "main/pages/HelpRequest/HelpRequestEditPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
  useBackendMutation: jest.fn(),
}));

const mutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useBackend.mockReturnValue({
    data: helpRequestFixtures.oneHelpRequest,
    error: null,
    status: "success",
  });
  useBackendMutation.mockReturnValue({ mutate, isSuccess: false });
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/helprequest/edit/1"]}>
      <Routes>
        <Route path="/helprequest/edit/:id" element={<HelpRequestEditPage />} />
      </Routes>
    </MemoryRouter>,
  );

test("fetches a record by id", () => {
  renderPage();
  expect(useBackend).toHaveBeenCalledWith(
    ["/api/HelpRequest", "1"],
    { method: "GET", url: "/api/HelpRequest", params: { id: "1" } },
    null,
  );
  expect(screen.getByLabelText("Requester Email")).toHaveValue("student1@ucsb.edu");
});

test("updates existing record", async () => {
  renderPage();
  fireEvent.change(screen.getByLabelText("Explanation"), {
    target: { value: "Issue resolved" },
  });
  fireEvent.click(screen.getByLabelText("Solved"));
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  await waitFor(() =>
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, explanation: "Issue resolved", solved: true }),
    ),
  );
});

test("PUT includes id as parameter and values in body", () => {
  const record = helpRequestFixtures.oneHelpRequest;
  expect(helpRequestPutParams(record)).toEqual({
    url: "/api/HelpRequest",
    method: "PUT",
    params: { id: 1 },
    data: record,
  });
});

test("shows loading state", () => {
  useBackend.mockReturnValue({ data: null, error: null, status: "loading" });
  renderPage();
  expect(screen.getByText("Loading HelpRequest...")).toBeInTheDocument();
});

test("shows an error state", () => {
  useBackend.mockReturnValue({ data: null, error: "Not found", status: "error" });
  renderPage();
  expect(screen.getByRole("alert")).toHaveTextContent("Not found");
});
