import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const admin = { root: { role: "ROLE_ADMIN" } };
const user = { root: { role: "ROLE_USER" } };

const renderTable = (currentUser, deleteCallback = jest.fn()) =>
  render(
    <MemoryRouter>
      <HelpRequestTable
        helpRequests={helpRequestFixtures.threeHelpRequests}
        currentUser={currentUser}
        deleteCallback={deleteCallback}
      />
    </MemoryRouter>,
  );

describe("HelpRequestTable", () => {
  test("shows the fields and rows", () => {
    renderTable(user);
    expect(screen.getByText("student1@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("Need help understanding API endpoints")).toBeInTheDocument();
    expect(screen.getByText("Requester Email")).toBeInTheDocument();
    expect(screen.getAllByText("No")).toHaveLength(2);
    expect(screen.getAllByText("Yes")).toHaveLength(1);
  });

  test("non-admin cannot see edit or delete buttons", () => {
    renderTable(user);
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  test("admin can delete a record", () => {
    const deleteCallback = jest.fn();
    renderTable(admin, deleteCallback);
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(deleteCallback).toHaveBeenCalledWith(helpRequestFixtures.threeHelpRequests[0]);
  });

  test("admin can navigate to edit page", () => {
    renderTable(admin);
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(3);
  });

  test("renders an empty table", () => {
    render(
      <MemoryRouter>
        <HelpRequestTable helpRequests={[]} currentUser={user} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Requester Email")).toBeInTheDocument();
  });
});
