import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authorizedAxiosInstance from '~/untils/authorizeAxios';
import { API_ROOT } from '~/untils/constrain';

const initialState = {
  currentNotifications: null,
};

export const fetchNotificationsAPI = createAsyncThunk(
  'notifications/fetchNotificationsAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/invitations/`
    );
    return response.data;
  }
);
export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ invitationId, status }) => {
    const response = await authorizedAxiosInstance.put(
      `${API_ROOT}/v1/invitations/board/${invitationId}`,
      { status }
    );
    return response.data;
  }
);
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null;
    },
    updateNotifications: (state, action) => {
      state.currentNotifications = action.payload;
    },
    // thêm 1 cái notification vào đầu mảng currentNotifications
    addNotifications: (state, action) => {
      const incomingNotifications = action.payload;
      state.currentNotifications.unshift(incomingNotifications);
    },
  },
  // Thiết lập middleware bất đồng bộ
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsAPI.fulfilled, (state, action) => {
        let incomingNotifications = action.payload;
        state.currentNotifications = Array.isArray(incomingNotifications)
          ? incomingNotifications.reverse()
          : [];
      })
      .addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
        const incomingNotifications = action.payload;
        // cập nhật lại data boardInvitation (bên trong nó sẽ có status mới sau khi update)
        const getInvitation = state.currentNotifications.find(
          (i) => i._id === incomingNotifications._id
        );
        if (getInvitation) {
          getInvitation.boardInvitation = incomingNotifications.boardInvitation;
        }
      });
  },
});
export const {
  clearCurrentNotifications,
  updateNotifications,
  addNotifications,
} = notificationsSlice.actions;

export const selectCurrentNotifications = (state) => {
  return state.notifications.currentNotifications;
};
export const notificationsReducer = notificationsSlice.reducer;
