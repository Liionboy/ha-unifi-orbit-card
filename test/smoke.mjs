import assert from "node:assert/strict";

globalThis.HTMLElement = class {
  attachShadow() { return { innerHTML: "" }; }
};
globalThis.customElements = {
  _items: new Map(),
  get(name) { return this._items.get(name); },
  define(name, value) { this._items.set(name, value); },
};
globalThis.document = { createElement() { return {}; } };

const { UnifiOrbitCard } = await import("../src/unifi-orbit-card.js");
const card = new UnifiOrbitCard();
card.setConfig({ title: "Test Orbit" });
assert.equal(card._config.theme, "auto");
card._hass = {
  locale: { language: "en-US" },
  states: {
    "sensor.udm_device_state": { state: "connected", attributes: { friendly_name: "UDM State" } },
    "sensor.udm_device_clients": { state: "6", attributes: { friendly_name: "UDM Clients" } },
    "sensor.udm_cpu_utilization": { state: "21", attributes: { unit_of_measurement: "%" } },
    "sensor.udm_client_bandwidth_rx": { state: "2", attributes: { unit_of_measurement: "MB/s" } },
  },
  entities: {
    "sensor.udm_device_state": { entity_id: "sensor.udm_device_state", platform: "unifi", device_id: "udm" , translation_key: "device_state" },
    "sensor.udm_device_clients": { entity_id: "sensor.udm_device_clients", platform: "unifi", device_id: "udm", translation_key: "device_clients" },
    "sensor.udm_cpu_utilization": { entity_id: "sensor.udm_cpu_utilization", platform: "unifi", device_id: "udm", translation_key: "device_cpu_utilization" },
    "sensor.udm_client_bandwidth_rx": { entity_id: "sensor.udm_client_bandwidth_rx", platform: "unifi", device_id: "udm", translation_key: "client_bandwidth_rx" },
  },
  devices: {
    udm: { name: "Gateway", model: "UDM Pro", manufacturer: "Ubiquiti Networks" },
  },
};

const data = card.collectData();
const renderSignature = card.renderSignature(data);
assert.equal(data.devices.length, 1);
assert.equal(data.online, 1);
assert.equal(data.clients, 6);
assert.equal(data.traffic.rx, 16);
assert.equal(data.devices[0].kind, "gateway");
assert.equal(data.devices[0].metrics.length, 2);
assert.equal(card.statusFor({ state: "unavailable" }), "offline");
assert.equal(card.toMbps({ state: "125000", attributes: { unit_of_measurement: "B/s" } }), 1);

const invalidThemeCard = new UnifiOrbitCard();
invalidThemeCard.setConfig({ title: "Test Orbit", theme: "not-a-theme" });
assert.equal(invalidThemeCard._config.theme, "auto");

card._hass.states["sensor.udm_device_clients"].state = "7";
assert.equal(card.renderSignature(card.collectData()), renderSignature, "state changes must not rebuild the animated scene");

console.log("UniFi Orbit smoke test passed");
