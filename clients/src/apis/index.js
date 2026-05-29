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
