import axios from "axios";

const API_BASE = "https://f218873f40789afd.mokky.dev";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const getClients = () => api.get("/clients");
export const getClient = (id) => api.get(`/clients/${id}`);
export const createClient = (data) => api.post("/clients", data);
export const updateClient = (id, data) => api.patch(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

export default api;
