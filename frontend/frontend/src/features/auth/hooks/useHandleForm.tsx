import { useState } from "react";
import type { User } from "@/types/types";
import { useAuthActions } from "./useAuthActions";

export function useHandleForm(mode = "register") {
  const { register, login } = useAuthActions();
  const [user, setUser] = useState<User>({
    email: "",
    password: "",
    role: "employee",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === "register") {
      await register(user);
    } else {
      await login(user);
    }
  }

  return {
    handleSubmit,
    user,
    setUser,
  };
}
