import axios from "axios";

const API = axios.create({
  baseURL: "https://nova-backend-syt5.onrender.com",
});

export default API;