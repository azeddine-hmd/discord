"use client";

import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api } from "@/config";

let pathWhitelist = ["/login", "/register", "/verify-email"];

type GlobalTemplateProps = {
  children?: React.ReactNode;
};

export default function GlobalTemplate({ children }: GlobalTemplateProps) {
  const [onRender, setOnRender] = useState(false);

  const passMut = useMutation({
    mutationFn: () => api.get("/api/auth/pass"),
    onSuccess: () => {
      setOnRender(true);
      window.clientSocket = io(
        process.env.NEXT_PUBLIC_BACKEND_DOMAIN as string,
        {
          transports: ["websocket"],
          withCredentials: true,
        }
      );
    },
    onError: () => window.location.assign("/login"),
  });

  const pathName = window.location.pathname;

  useEffect(() => {
    if (!pathWhitelist.some((path) => pathName.startsWith(path))) {
      passMut.mutate();
    } else {
      setOnRender(true);
    }
  }, [passMut, pathName]);

  return (
    <>
      {onRender && (
        <div className="h-full w-full overflow-hidden">{children}</div>
      )}
    </>
  );
}
