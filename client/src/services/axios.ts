import axios from "axios";
import { getToken } from "./utils";
import { ENV } from "./config";

const axiosIntance = axios.create({
  baseURL: ENV.API_BASE_PATH,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosIntance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    } else {
      delete axiosIntance.defaults.headers.common.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosIntance;
