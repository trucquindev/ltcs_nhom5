import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWorkspacesAPI, fetchWorkspaceDetailsAPI } from "~/apis";

const initialState = {
  workspaces: null,
  activeWorkspace: null,
  isLoading: false,
  error: null,
};

export const fetchWorkspacesThunk = createAsyncThunk(
  "workspace/fetchWorkspaces",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchWorkspacesAPI();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const fetchActiveWorkspaceThunk = createAsyncThunk(
  "workspace/fetchActiveWorkspace",
  async (workspaceId, { rejectWithValue }) => {
    try {
      const data = await fetchWorkspaceDetailsAPI(workspaceId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspaceLocally: (state, action) => {
      state.activeWorkspace = action.payload;
    },
    clearWorkspaceData: (state) => {
      state.workspaces = null;
      state.activeWorkspace = null;
    },
  },
  extraReducers: (builder) => {
    // fetchWorkspacesThunk
    builder.addCase(fetchWorkspacesThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchWorkspacesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workspaces = action.payload;
      // If we don't have an active workspace, set it to the first one
      if (!state.activeWorkspace && action.payload?.length > 0) {
        state.activeWorkspace = action.payload[0];
      }
    });
    builder.addCase(fetchWorkspacesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // fetchActiveWorkspaceThunk
    builder.addCase(fetchActiveWorkspaceThunk.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchActiveWorkspaceThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.activeWorkspace = action.payload;
    });
    builder.addCase(fetchActiveWorkspaceThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { setActiveWorkspaceLocally, clearWorkspaceData } =
  workspaceSlice.actions;
export const selectWorkspaces = (state) => state.workspace.workspaces;
export const selectActiveWorkspace = (state) => state.workspace.activeWorkspace;
export const selectWorkspaceLoading = (state) => state.workspace.isLoading;

export const workspaceReducer = workspaceSlice.reducer;
