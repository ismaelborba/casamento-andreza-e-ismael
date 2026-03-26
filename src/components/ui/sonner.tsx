"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      visibleToasts={3}
      position="bottom-right"
      offset={{ bottom: 20, right: 20 }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "site-toast-shell",
        },
      }}
    />
  );
}
