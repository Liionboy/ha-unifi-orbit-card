import assert from "node:assert/strict";

globalThis.HTMLElement = class {
  attachShadow() { return { innerHTML: "", querySelector() { return null; }, querySelectorAll() { return []; } }; }
};
globalThis.customElements = {
  _items: new Map(),
  get(name) { return this._items.get(name); },
  define(name, value) { this._items.set(name, value); },
};
globalThis.document = { createElement() { return {}; } };

const { UnifiOrbitCard, UnifiCommandCenterCard } = await import("../src/unifi-orbit-card.js");
assert.equal(customElements.get("unifi-command-center-card"), UnifiCommandCenterCard);
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
    "sensor.wlan_clients": { state: "4", attributes: { friendly_name: "WLAN clients" } },
    "sensor.ap_device_state": { state: "connected", attributes: { friendly_name: "Access Point State" } },
    "sensor.switch_device_state": { state: "connected", attributes: { friendly_name: "Switch State" } },
    "button.switch_port_power_cycle": { state: "unknown", attributes: { friendly_name: "Switch Port Power Cycle" } },
  },
  entities: {
    "sensor.udm_device_state": { entity_id: "sensor.udm_device_state", platform: "unifi", device_id: "udm" , translation_key: "device_state" },
    "sensor.udm_device_clients": { entity_id: "sensor.udm_device_clients", platform: "unifi", device_id: "udm", translation_key: "device_clients" },
    "sensor.udm_cpu_utilization": { entity_id: "sensor.udm_cpu_utilization", platform: "unifi", device_id: "udm", translation_key: "device_cpu_utilization" },
    "sensor.udm_client_bandwidth_rx": { entity_id: "sensor.udm_client_bandwidth_rx", platform: "unifi", device_id: "udm", translation_key: "client_bandwidth_rx" },
    "sensor.wlan_clients": { entity_id: "sensor.wlan_clients", platform: "unifi", device_id: "wlan", translation_key: "wlan_clients" },
    "sensor.ap_device_state": { entity_id: "sensor.ap_device_state", platform: "unifi", device_id: "ap", translation_key: "device_state" },
    "sensor.switch_device_state": { entity_id: "sensor.switch_device_state", platform: "unifi", device_id: "switch", translation_key: "device_state" },
    "button.switch_port_power_cycle": { entity_id: "button.switch_port_power_cycle", platform: "unifi", device_id: "switch", translation_key: "port_power_cycle" },
  },
  devices: {
    udm: { name: "Gateway", model: "UDM Pro", manufacturer: "Ubiquiti Networks" },
    wlan: { name: "Wireless Network", model: "UniFi WLAN", manufacturer: "Ubiquiti" },
    ap: { name: "Access Point", model: "U7PG2", manufacturer: "Ubiquiti" },
    switch: { name: "Switch", model: "USL8LPB", manufacturer: "Ubiquiti" },
  },
};

const data = card.collectData();
const renderSignature = card.renderSignature(data);
assert.equal(data.devices.length, 3, "logical UniFi WLAN entries are not physical topology nodes");
assert.equal(data.online, 3);
assert.equal(data.clients, 4);
assert.equal(data.traffic.rx, 16);
assert.equal(data.devices[0].kind, "gateway");
assert.equal(data.devices[0].metrics.length, 2);
assert.equal(data.devices.find((device) => device.id === "ap").kind, "access point");
assert.equal(data.devices.find((device) => device.id === "switch").kind, "switch");
assert.equal(card.statusFor({ state: "unavailable" }), "offline");
assert.equal(card.toMbps({ state: "125000", attributes: { unit_of_measurement: "B/s" } }), 1);

const invalidThemeCard = new UnifiOrbitCard();
invalidThemeCard.setConfig({ title: "Test Orbit", theme: "not-a-theme" });
assert.equal(invalidThemeCard._config.theme, "auto");

card._hass.states["sensor.udm_device_clients"].state = "7";
assert.equal(card.renderSignature(card.collectData()), renderSignature, "state changes must not rebuild the animated scene");

const commandCenter = new UnifiCommandCenterCard();
commandCenter.setConfig({ title: "Command Center" });
commandCenter._hass = card._hass;
commandCenter.render();
assert.match(commandCenter._root.innerHTML, /command-center/);

console.log("UniFi Orbit smoke test passed");
