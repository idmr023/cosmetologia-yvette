"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener("statechange", () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("Nueva versión disponible. Recarga para actualizar.");
                }
              });
            }
          });
        })
        .catch(console.error);
    }
  }, []);

  return null;
}
