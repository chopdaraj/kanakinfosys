import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kanak_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Indian numbering formatter: 100000 -> 1,00,000
export const formatINR = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "₹0";
  const n = Number(num);
  const fixed = n.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const withCommas =
    rest.length > 0
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  const trimmed = decPart === "00" ? withCommas : `${withCommas}.${decPart}`;
  return `₹${trimmed}`;
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
