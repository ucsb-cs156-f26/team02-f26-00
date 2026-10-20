import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
    useNavigate: () => mockUseNavigate,
  };
});

let axiosMock;
describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/UCSBDiningCommonsMenuItem", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit UCSBDiningCommonsMenuItem");
      expect(
        screen.queryByTestId("UCSBDiningCommonsMenuItemForm-name"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/UCSBDiningCommonsMenuItem", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          diningCommonsCode: "ortega",
          name: "Baked Pesto Pasta with Chicken",
          station: "Entree Specials",
        });
      axiosMock.onPut("/api/UCSBDiningCommonsMenuItem").reply(200, {
        id: "17",
        diningCommonsCode: "portola",
        name: "Cream of Broccoli Soup (v)",
        station: "Greens & Grains",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBDiningCommonsMenuItemForm-id");

      const idField = screen.getByTestId("UCSBDiningCommonsMenuItemForm-id");
      const diningCommonsCodeField = screen.getByTestId(
        "UCSBDiningCommonsMenuItemForm-diningCommonsCode",
      );
      const nameField = screen.getByTestId(
        "UCSBDiningCommonsMenuItemForm-name",
      );
      const stationField = screen.getByTestId(
        "UCSBDiningCommonsMenuItemForm-station",
      );
      const submitButton = screen.getByTestId(
        "UCSBDiningCommonsMenuItemForm-submit",
      );

      expect(idField).toHaveValue("17");
      expect(diningCommonsCodeField).toHaveValue("ortega");
      expect(nameField).toHaveValue("Baked Pesto Pasta with Chicken");
      expect(stationField).toHaveValue("Entree Specials");
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(diningCommonsCodeField, {
        target: { value: "portola" },
      });
      fireEvent.change(nameField, {
        target: { value: "Cream of Broccoli Soup (v)" },
      });
      fireEvent.change(stationField, {
        target: { value: "Greens & Grains" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "UCSBDiningCommonsMenuItem Updated - id: 17 name: Cream of Broccoli Soup (v)",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/diningcommonsmenuitem" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          diningCommonsCode: "portola",
          name: "Cream of Broccoli Soup (v)",
          station: "Greens & Grains",
        }),
      ); // posted object
    });

    test("Does not save when data is invalid, and shows error messages", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBDiningCommonsMenuItemForm-id");

      fireEvent.change(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode"),
        { target: { value: "Bad Code" } },
      );
      fireEvent.change(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"),
        { target: { value: "" } },
      );
      fireEvent.click(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-submit"),
      );

      expect(
        await screen.findByText(
          /Dining Commons Code must be lowercase letters separated by dashes/,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Name is required.")).toBeInTheDocument();
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Does not save and goes back when Cancel is clicked", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBDiningCommonsMenuItemEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBDiningCommonsMenuItemForm-id");

      fireEvent.change(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-name"),
        { target: { value: "Changed Name" } },
      );
      fireEvent.click(
        screen.getByTestId("UCSBDiningCommonsMenuItemForm-cancel"),
      );

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
    });
  });
});
