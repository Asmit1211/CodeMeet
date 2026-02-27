import axiosInstance from "../lib/axios";

export const paymentApi = {
  createOrder: async () => {
    const response = await axiosInstance.post("/payment/create-order");
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post("/payment/verify", paymentData);
    return response.data;
  },
};
