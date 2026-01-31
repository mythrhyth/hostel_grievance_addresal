import API from "@/lib/api";

export const loginUser = async (email: string, password: string) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (data: any) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};
