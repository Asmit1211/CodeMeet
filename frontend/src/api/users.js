import axiosInstance from "../lib/axios";

export const userApi = {
  syncUser: async () => {
    const response = await axiosInstance.post("/users/sync");
    return response.data;
  },

  getMe: async () => {
    const response = await axiosInstance.post("/users/sync");
    return response.data;
  },
};
