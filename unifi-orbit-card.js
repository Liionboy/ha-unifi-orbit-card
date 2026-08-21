import { UnifiOrbitCard } from "./src/unifi-orbit-card.js";

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "custom:unifi-orbit-card")) {
  window.customCards.push({
    type: "custom:unifi-orbit-card",
    name: "UniFi Orbit Card",
    description: "Animated, auto-discovering UniFi Network observatory for Home Assistant.",
    preview: true,
  });
}

export { UnifiOrbitCard };
