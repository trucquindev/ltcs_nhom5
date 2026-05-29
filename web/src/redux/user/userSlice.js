import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import authorizedAxiosInstance from '~/untils/authorizeAxios';
import { API_ROOT } from '~/untils/constrain';
const initialState = {
  currentUser: null,
};
// các hình đồng gọi api bất đồng bộ và cập nhật dữ liệu vào redux , duubgf middleware createAsysncThunk di kem voi extrareducer
export const loginUserAPI = createAsyncThunk(
  'activeBoard/loginUserAPI',
  async (data) => {
    // Gọi API để lấy thông tin của board
    const response = await authorizedAxiosInstance.post(
      `${API_ROOT}/v1/users/login`,
      data
    );
    return response.data;
  }
);
export const logoutUserAPI = createAsyncThunk(
  'activeBoard/logoutUserAPI',
  async (showSuccessMessage = true) => {
    // Gọi API để lấy thông tin của board
    const response = await authorizedAxiosInstance.delete(
      `${API_ROOT}/v1/users/logout`
    );
    if (showSuccessMessage) {
      toast.success('Đăng xuất thành công');
    }
    return response.data;
  }
);
export const updateUserAPI = createAsyncThunk(
  'activeBoard/updateUserAPI',
  async (data) => {
    // Gọi API để lấy thông tin của board
    const response = await authorizedAxiosInstance.put(
      `${API_ROOT}/v1/users/update`,
      data
    );
    return response.data;
  }
);
// Khởi tạo một cái slice trong kho lưu trữ - Redux Store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // Reducers : Nơi xử lí dữ liệu đồng bộ
  reducers: {},
  //extraReducers: noi xu li du lieu bat dong bo
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      const user = action.payload;
      // Store accessToken for Bearer auth with LTCS C# backend
      state.currentUser = user;
    });

    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.currentUser = null;
    });
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload;
      state.currentUser = user;
    });
  },
  // Thiết lập middleware cho thông tin mới nhất của board
});

// Actions : là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// export const {} = userSlice.actions;

// Selectors: là nơi dành cho các components bên dưới gọi bằng hooks useSelectỏ () để lấy dữ liệu tử kho redux ra xử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser;
};
// tên của file là activeBoardSlide nhưng phải export ra cái reducer
export const userReducer = userSlice.reducer;
