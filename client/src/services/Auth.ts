import axios from "./axios";
import { getToken, removeToken, storeToken } from "./utils";
import { APIAction } from "./types";
import { ACTION, ACTIONS } from "./actions";

const register = (
  payload: APIAction.Auth.Register.Payload,
): Promise<
  APIAction.Result<APIAction.Auth.Register.ResultSuccess["payload"]>
> => {
  return new Promise((resolve, reject) => {
    axios
      .post<APIAction.Auth.Register.Result>("/auth/register", payload, {})
      .then((res) => {
        if (!res.data.created) {
          resolve({
            action: ACTION.AUTH.REGISTER.RESPONSE._,
            success: false,
            message: res.data.message,
          });
          return;
        }

        resolve({
          action: ACTION.AUTH.REGISTER.RESPONSE._,
          success: true,
          payload: res.data.payload,
        });
      })
      .catch((err) => {
        reject({ action: ACTION.AUTH.REGISTER.SYSTEM._, message: err });
      });
  });
};

const reauth = (
  from: keyof ACTIONS["AUTH"] = "REAUTH",
): Promise<
  APIAction.Result<APIAction.Auth.Reauth.ResultSuccess["payload"]>
> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      resolve({
        action: ACTION.AUTH[from].RESPONSE._,
        success: false,
        message: "No token found",
      });
      return;
    }

    axios
      .post<APIAction.Auth.Reauth.Result>("/auth/reauth")
      .then((res) => {
        if (!res.data.found) {
          resolve({
            action: ACTION.AUTH[from].RESPONSE._,
            success: false,
            message: res.data.message,
          });
          return;
        }

        resolve({
          action: ACTION.AUTH[from].RESPONSE._,
          success: true,
          payload: res.data.payload,
        });
      })
      .catch((err) => {
        reject({
          action: ACTION.AUTH[from].SYSTEM._,
          message: err,
        });
      });
  });
};

const login = (
  payload: APIAction.Auth.Login.Payload,
): Promise<
  APIAction.Result<APIAction.Auth.Reauth.ResultSuccess["payload"]>
> => {
  return new Promise((resolve, reject) => {
    axios
      .post<APIAction.Auth.Login.Result>(`/auth/login`, payload)
      .then((res) => {
        if (!res.data.authenticated) {
          resolve({
            action: ACTION.AUTH.LOGIN.RESPONSE._,
            success: false,
            message: res.data.message,
          });
          return;
        }
        const { token, expiresIn } = res.data.payload;

        storeToken(token, expiresIn);

        return reauth("LOGIN");
      })
      .catch((err) => {
        reject({ action: ACTION.AUTH.LOGIN.SYSTEM._, message: err });
      });
  });
};

const logout = (): Promise<
  APIAction.Result<APIAction.Auth.Logout.ResultSuccess["payload"]>
> => {
  return new Promise((resolve) => {
    removeToken();
    resolve({
      action: ACTION.AUTH.LOGOUT.RESPONSE._,
      success: true,
      payload: {},
    });
  });
};

export const AuthService = {
  register,
  reauth,
  login,
  logout,
};
