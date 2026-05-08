import axios from "axios";

export const API = axios.create({
  baseURL: "https://college-event-backend-6.onrender.com"
});