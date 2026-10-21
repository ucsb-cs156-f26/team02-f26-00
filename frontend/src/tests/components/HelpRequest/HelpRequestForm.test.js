import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const fillForm = () => {
  fireEvent.change(screen.getByLabelText("Requester Email"), {
    target: { value: "newstudent@ucsb.edu" },
  });
  fireEvent.change(screen.getByLabelText("Team ID"), {
    target: { value: "team02" },
  });
  fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
    target: { value: "Table 4" },
  });
  fireEvent.change(screen.getByLabelText("Request Time"), {
    target: { value: "2026-10-21T10:15:00" },
  });
  fireEvent.change(screen.getByLabelText("Explanation"), {
    target: { value: "Need help with integration tests" },
  });
};

describe("HelpRequestForm", () => {
  test("prevents submitting an empty form", async () => {
    const submitAction = jest.fn();
    render(<HelpRequestForm submitAction={submitAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("prevents submission of an invalid email", async () => {
    const submitAction = jest.fn();
    render(<HelpRequestForm submitAction={submitAction} />);
    fillForm();
    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("submits valid new help request with a false solved flag", async () => {
    const submitAction = jest.fn();
    render(<HelpRequestForm submitAction={submitAction} />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(submitAction).toHaveBeenCalledWith({
        requesterEmail: "newstudent@ucsb.edu",
        teamId: "team02",
        tableOrBreakoutRoom: "Table 4",
        requestTime: "2026-10-21T10:15:00",
        explanation: "Need help with integration tests",
        solved: false,
      }),
    );
  });

  test("edit form is prefilled and submits id and solved=true", async () => {
    const submitAction = jest.fn();
    render(
      <HelpRequestForm
        initialContents={helpRequestFixtures.threeHelpRequests[1]}
        submitAction={submitAction}
        buttonLabel="Update"
      />,
    );
    expect(screen.getByLabelText("Requester Email")).toHaveValue("student2@ucsb.edu");
    expect(screen.getByLabelText("Solved")).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() =>
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2, solved: true }),
      ),
    );
  });

  test("cancel button invokes callback", () => {
    const cancelAction = jest.fn();
    render(<HelpRequestForm submitAction={jest.fn()} cancelAction={cancelAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancelAction).toHaveBeenCalledTimes(1);
  });
});
