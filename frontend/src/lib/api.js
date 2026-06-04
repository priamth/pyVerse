import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchCategories = () => api.get("/categories").then((r) => r.data);
export const fetchTools = (params) =>
  api.get("/tools", { params }).then((r) => r.data);
export const fetchTool = (id) => api.get(`/tools/${id}`).then((r) => r.data);
export const trackClick = (id) =>
  api.post(`/tools/${id}/click`).then((r) => r.data);
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const fetchRepos = () => api.get("/github/repos").then((r) => r.data);
export const createTool = (body) => api.post("/tools", body).then((r) => r.data);
export const updateTool = (id, body) =>
  api.put(`/tools/${id}`, body).then((r) => r.data);
export const deleteTool = (id) =>
  api.delete(`/tools/${id}`).then((r) => r.data);
