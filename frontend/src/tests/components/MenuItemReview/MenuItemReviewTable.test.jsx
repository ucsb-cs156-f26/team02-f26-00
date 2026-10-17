import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import MenuItemReviewTable from "main/components/MenuItemReview/MenuItemReviewTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "id",
    "Item Id",
    "Reviewer Email",
    "Stars",
    "Date Reviewed",
    "Comments",
  ];
  const expectedFields = [
    "id",
    "itemId",
    "reviewerEmail",
    "stars",
    "dateReviewed",
    "comments",
  ];
  const testId = "MenuItemReviewTable";

  const renderTable = (currentUser, extraProps = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewTable
            reviews={menuItemReviewFixtures.threeReviews}
            currentUser={currentUser}
            {...extraProps}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const checkHeadersAndContent = (prefix) => {
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const cell = screen.getByTestId(`${prefix}-cell-row-0-col-${field}`);
      expect(cell).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${prefix}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${prefix}-cell-row-0-col-itemId`),
    ).toHaveTextContent("27");
    expect(
      screen.getByTestId(`${prefix}-cell-row-0-col-reviewerEmail`),
    ).toHaveTextContent("cgaucho@ucsb.edu");
    expect(
      screen.getByTestId(`${prefix}-cell-row-0-col-stars`),
    ).toHaveTextContent("3");
    expect(
      screen.getByTestId(`${prefix}-cell-row-0-col-dateReviewed`),
    ).toHaveTextContent("2022-01-02T12:00:00");
    expect(
      screen.getByTestId(`${prefix}-cell-row-0-col-comments`),
    ).toHaveTextContent("a bit bland, but edible");

    expect(screen.getByTestId(`${prefix}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${prefix}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(
      screen.getByTestId(`${prefix}-cell-row-2-col-reviewerEmail`),
    ).toHaveTextContent("ldelplaya@ucsb.edu");
  };

  test("Has the expected column headers and content for ordinary user", () => {
    renderTable(currentUserFixtures.userOnly);

    checkHeadersAndContent(testId);

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for adminUser", () => {
    renderTable(currentUserFixtures.adminUser);

    checkHeadersAndContent(testId);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Uses a custom testIdPrefix when one is passed", () => {
    renderTable(currentUserFixtures.adminUser, { testIdPrefix: "Custom" });

    checkHeadersAndContent("Custom");
    expect(
      screen.getByTestId(`Custom-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`Custom-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    renderTable(currentUserFixtures.adminUser);

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/menuitemreview/edit/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/MenuItemReview")
      .reply(200, { message: "MenuItemReview deleted" });

    // act - render the component
    renderTable(currentUserFixtures.adminUser);

    // assert - check that the expected content is rendered
    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    const restoreConsole = mockConsole();
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called
    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].url).toBe("/api/MenuItemReview");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    // assert - check that the success message was logged and toasted
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith({
        message: "MenuItemReview deleted",
      }),
    );
    expect(console.log).toHaveBeenCalledWith({
      message: "MenuItemReview deleted",
    });
    restoreConsole();
  });
});
