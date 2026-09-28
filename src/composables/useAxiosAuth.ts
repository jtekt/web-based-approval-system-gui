import axios, { type AxiosInstance } from "axios";
import { watch } from "vue";
import { useAuth } from "@jtekt/vuetify-auth";

// Sends the session token with every request of the given axios instance, and
// ends the session when an API answers 401. A 403 means "not allowed", not
// "not logged in", so it is left to the caller. No expiry check is needed:
// @jtekt/vuetify-auth never keeps an expired token in the session.
export function useAxiosAuth(instance: AxiosInstance = axios) {
  const { session, logout } = useAuth();

  watch(
    () => session.value?.accessToken,
    (token) => {
      if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      else delete instance.defaults.headers.common["Authorization"];
    },
    { immediate: true },
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) await logout();
      return Promise.reject(error);
    },
  );
}
