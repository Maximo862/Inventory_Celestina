import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RedirectOptions {
  condition: boolean;
  path: string;
}

export function useRedirect({ condition, path }: RedirectOptions) {
  const navigate = useNavigate();

  useEffect(() => {
    if (condition) navigate(path);
  }, [condition, path]);
}
