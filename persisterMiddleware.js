import { createListenerMiddleware } from "@reduxjs/toolkit";

export const persisterMiddleware = createListenerMiddleware();

persisterMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    // Simplified predicate logic
    return currentState !== previousState;
  },
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
    const { sessionId } = state.uiData;

    if (sessionId) {
      try {
        const response = await fetch("/api/save-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state }),
        });

        if (!response.ok) {
          console.error(`HTTP error! Status: ${response.status}`);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error(`There was an error: ${error}`);
      }
    }
  },
});
