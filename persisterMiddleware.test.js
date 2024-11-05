import { configureStore, createSlice } from "@reduxjs/toolkit";
import { persisterMiddleware } from "./persisterMiddleware";

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error
const consoleErrorSpy = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Create a simple slice for testing
const uiDataSlice = createSlice({
  name: "uiData",
  initialState: { sessionId: null },
  reducers: {
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
  },
});

const { setSessionId } = uiDataSlice.actions;

// Configure the store
const store = configureStore({
  reducer: {
    uiData: uiDataSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persisterMiddleware.middleware),
});

describe("persisterMiddleware", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    fetch.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should log an error if state cannot be stored", async () => {
    const sessionId = "test-session-id";

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Session ID is required",
    });

    store.dispatch(setSessionId(sessionId));

    jest.runAllTimers();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    // expect(consoleErrorSpy).toHaveBeenCalledWith(
    //   "There was an error: Error: HTTP error! Status: 500"
    // );
  });
});
