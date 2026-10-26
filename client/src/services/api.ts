import axios from "axios";
import {
  sampleProjects,
  sampleProfile,
  sampleNext,
  sampleSettings,
} from "../../../shared/src/index";
export const demo = import.meta.env.VITE_DEMO_MODE !== "false";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  timeout: 15000,
});
let csrf = "";
export async function mutate(
  method: "post" | "patch" | "delete",
  path: string,
  data?: unknown,
) {
  if (!csrf) csrf = (await api.get("/admin/csrf")).data.csrfToken;
  return (
    await api.request({
      method,
      url: path,
      data,
      headers: { "X-CSRF-Token": csrf },
    })
  ).data;
}
export async function read(path: string) {
  if (demo) {
    if (path === "/profile") return sampleProfile;
    if (path === "/settings") return sampleSettings;
    if (path === "/next-build") return sampleNext;
    if (path === "/projects" || path === "/projects/featured")
      return sampleProjects;
    if (path.startsWith("/projects/")) {
      const p = sampleProjects.find((p) => p.slug === path.split("/").pop());
      if (!p) throw new Error("Build not found");
      return p;
    }
    if (path === "/build-logs") return [];
    if (path.startsWith("/admin"))
      throw new Error("Read-only demo. Connect the backend to sign in.");
  }
  return (await api.get(path)).data;
}
export function errorText(err: unknown) {
  return axios.isAxiosError(err)
    ? err.response?.data?.error || "Unable to connect. Please try again."
    : err instanceof Error
      ? err.message
      : "Something went wrong.";
}
