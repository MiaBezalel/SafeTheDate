import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}
// Interceptor for handling response errors
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: CustomAxiosRequestConfig =
      error.config as CustomAxiosRequestConfig;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.log("regenerateAccessToken");
      const response = await backendAPI.auth.regenerateAccessToken();
      if (response) {
        return axios(originalRequest);
        // Retry the original request
      }
    }
    // For other types of errors, or if the request was retried and still failed, pass the error along
    throw error;
  }
);

const prefix = process.env.REACT_APP_BACKEND_AUTH_URL + "/api/auth";

const REST_API = {
  auth: {
    signInWithEmailAndPassword: prefix + "/login",
    resetPasswordSendMail: prefix + "/reset/token",
    resetPassword: prefix + "/reset",
    getCurrentSession: prefix + "/session",
    confirmMail: prefix + "/confirm",
    regenerateAccessToken: prefix + "/token",
    signUpWithEmailAndPassword: prefix + "/register",
    loginAuthWithGoogle: prefix + "/google/login",
    logout: prefix + "/logout",
  },
};

const backendAPI = {
  auth: {
    async signInWithEmailAndPassword(
      emailOrUsername: string,
      password: string
    ) {
      return await axios.post(
        REST_API.auth.signInWithEmailAndPassword,
        {
          emailOrUsername,
          password,
        },
        {
          withCredentials: true,
        }
      );
    },

    async resetPasswordSendMail(usernameOrMail: string) {
      return await axios.put(REST_API.auth.resetPasswordSendMail, {
        usernameOrMail,
      });
    },

    async resetPassword(newPassword: string, token: string) {
      return await axios.put(REST_API.auth.resetPassword, {
        password: newPassword,
        token,
      });
    },

    async loginAuthWithGoogle(accessToken: string) {
      return await axios.post(
        REST_API.auth.loginAuthWithGoogle,
        {
          accessToken,
        },
        {
          withCredentials: true,
        }
      );
    },

    async signUpWithEmailAndPassword(
      email: string,
      username: string,
      firstName: string,
      lastName: string,
      password: string
    ) {
      return await axios.post(
        REST_API.auth.signUpWithEmailAndPassword,
        {
          email: email,
          username: username,
          firstName: firstName,
          lastName: lastName,
          password: password,
        },
        {
          withCredentials: true,
        }
      );
    },

    async getCurrentSession() {
      return await axios.get(REST_API.auth.getCurrentSession, {
        withCredentials: true,
      });
    },
    async confirmMail(confirmation: string) {
      return await axios.put(
        REST_API.auth.confirmMail,
        { confirmId: confirmation },
        {
          withCredentials: true,
        }
      );
    },

    async regenerateAccessToken() {
      return await axios.post(
        REST_API.auth.regenerateAccessToken,
        {},
        {
          withCredentials: true,
        }
      );
    },

    async logOut() {
      return await axios.post(
        REST_API.auth.logout,
        {},
        {
          withCredentials: true,
        }
      );
    },
  },
};

export default backendAPI;
