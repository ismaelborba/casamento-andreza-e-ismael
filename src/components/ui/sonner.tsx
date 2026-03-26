"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      closeButton
      expand
      visibleToasts={4}
      position="top-right"
      offset={{ top: 112, right: 20 }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "site-toast",
          title: "site-toast-title",
          description: "site-toast-description",
          actionButton: "site-toast-action",
          closeButton: "site-toast-close",
          icon: "site-toast-icon",
        },
      }}
    />
  );
}
