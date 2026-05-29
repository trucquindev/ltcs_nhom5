import { API_ROOT } from "~/untils/constrain";

export const updateBoardDetailsApi = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/boards/${boardId}`,
    updateData,
  );
  return response.data;
};

export const fetchBoardAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(
    `${API_ROOT}/v1/boards${searchPath}`,
  );
  return response.data;
};

export const createNewBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/boards`,
    data,
  );
  toast.success("Board created successfully");
  return response.data;
};

export const moveCardDifferentColumnAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/boards/supports/moving_card`,
    updateData,
  );
  return response.data;
};

export const createNewColumnAPI = async (dataColumn) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/columns/`,
    dataColumn,
  );
  return response.data;
};

export const deleteColumnAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(
    `${API_ROOT}/v1/columns/${columnId}`,
  );
  return response.data;
};

export const updateColumnDetailsApi = async (columnId, updateData) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/columns/${columnId}`,
    updateData,
  );
  return response.data;
};

export const createNewCardAPI = async (dataCard) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/cards/`,
    dataCard,
  );
  return response.data;
};

export const updateCardDetailAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/cards/${cardId}`,
    updateData,
  );
  return response.data;
};

export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/users/register`,
    data,
  );
  toast.success(
    "Account successfully registered!, Please check and verify your mail before logging in!",
    { theme: "colored" },
  );
  return response.data;
};

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/users/verify`,
    data,
  );
  toast.success(
    "Account successfully verify!, Now you can login and enjoy our services! Have a good day!",
    { theme: "colored" },
  );
  return response.data;
};

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(
    `${API_ROOT}/v1/users/refresh_token`,
  );
  return response.data;
};

export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/invitations/board`,
    data,
  );
  toast.success("User invited to board successfully");
  return response.data;
};

export const fetchNotificationsAPI = async () => {
  const response = await authorizedAxiosInstance.get(
    `${API_ROOT}/v1/invitations/`,
  );
  return response.data;
};

export const updateBoardInvitationAPI = async (invitationId, status) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/invitations/board/${invitationId}`,
    { status },
  );
  return response.data;
};

export const fetchCardActivityAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.get(
    `${API_ROOT}/v1/cards/${cardId}/activity`,
  );
  return response.data;
};