import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HelpRequestCreatePage, {
  helpRequestPostParams,
} from "main/pages/HelpRequest/HelpRequestCreatePage";
import { useBackendMutation } from "main/utils/useBackend";

jest.mock("main/utils/useBackend", () => ({
  useBackendMutation: jest.fn(),
}));

const mutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useBackendMutation.mockReturnValue({ mutate, isSuccess: false });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <HelpRequestCreatePage />
    </MemoryRouter>,
  );

test("displays create form", () => {
  renderPage();
  expect(screen.getByText("Create HelpRequest")).toBeInTheDocument();
  expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
});

test("maps form values to the POST query parameters", () => {
  expect(
    helpRequestPostParams({
      requesterEmail: "a@ucsb.edu",
      teamId: "a",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2026-10-20T10:00:00",
      explanation: "Question",
      solved: false,
    }),
  ).toEqual({
    url: "/api/HelpRequest/post",
    method: "POST",
    params: {
      requesterEmail: "a@ucsb.edu",
      teamId: "a",
      tableOrBreakoutRoom: "Table 2",
      requestTime: "2026-10-20T10:00:00",
      explanation: "Question",
      solved: false,
    },
  });
});

test("submits valid form to the mutation", async () => {
  renderPage();
  fireEvent.change(screen.getByLabelText("Requester Email"), {
    target: { value: "a@ucsb.edu" },
  });
  fireEvent.change(screen.getByLabelText("Team ID"), {
    target: { value: "team02" },
  });
  fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
    target: { value: "Table 2" },
  });
  fireEvent.change(screen.getByLabelText("Request Time"), {
    target: { value: "2026-10-20T10:00:00" },
  });
  fireEvent.change(screen.getByLabelText("Explanation"), {
    target: { value: "Question" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  await waitFor(() => {
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ requesterEmail: "a@ucsb.edu", solved: false }),
    );
  });
});

test("invalid form does not POST", async () => {
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
  expect(mutate).not.toHaveBeenCalled();
});
