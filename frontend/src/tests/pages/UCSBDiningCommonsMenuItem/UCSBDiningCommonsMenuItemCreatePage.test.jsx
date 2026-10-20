import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Dining Commons Code")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Create New UCSBDiningCommonsMenuItem"),
    ).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /diningcommonsmenuitem", async () => {
    const queryClient = new QueryClient();
    const menuItem = {
      id: 17,
      diningCommonsCode: "ortega",
      name: "Baked Pesto Pasta with Chicken",
      station: "Entree Specials",
    };

    axiosMock
      .onPost("/api/UCSBDiningCommonsMenuItem/post")
      .reply(202, menuItem);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Dining Commons Code")).toBeInTheDocument();
    });

    const diningCommonsCodeInput = screen.getByLabelText("Dining Commons Code");
    const nameInput = screen.getByLabelText("Name");
    const stationInput = screen.getByLabelText("Station");
    const createButton = screen.getByText("Create");

    fireEvent.change(diningCommonsCodeInput, { target: { value: "ortega" } });
    fireEvent.change(nameInput, {
      target: { value: "Baked Pesto Pasta with Chicken" },
    });
    fireEvent.change(stationInput, { target: { value: "Entree Specials" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "ortega",
      name: "Baked Pesto Pasta with Chicken",
      station: "Entree Specials",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New UCSBDiningCommonsMenuItem Created - id: 17 name: Baked Pesto Pasta with Chicken",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/diningcommonsmenuitem" });
  });

  test("on submit with invalid data, does not make request to backend or redirect", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Dining Commons Code")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
