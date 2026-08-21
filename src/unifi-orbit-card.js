const CARD_VERSION = "0.1.3";

const DEFAULTS = {
  title: "UniFi Orbit",
  auto_discover: true,
  entities: [],
  max_devices: 8,
  show_clients: true,
  show_traffic: true,
  show_updates: true,
  theme: "auto",
};

const TECHNICAL_KEYS = new Set([
  "friendly_name",
  "icon",
  "device_class",
  "state_class",
  "supported_features",
  "unit_of_measurement",
  "entity_picture",
]);

const STATUS_WORDS = {
  connected: "online",
  online: "online",
  home: "online",
  pending: "pending",
  provisioning: "provisioning",
  upgrading: "upgrading",
  disconnected: "offline",
  offline: "offline",
  heartbeat_missed: "offline",
  unavailable: "offline",
  unknown: "unknown",
};

const STYLES = `
  :host { display: block; color: var(--primary-text-color); font: inherit; }
  ha-card.orbit-card {
    --orbit-bg: var(--card-background-color, var(--ha-card-background, #ffffff));
    --orbit-surface: var(--secondary-background-color, var(--card-background-color, #f6f7f9));
    --orbit-line: var(--divider-color, rgba(0, 0, 0, .12));
    --orbit-text: var(--primary-text-color, #202124);
    --orbit-muted: var(--secondary-text-color, #6b7280);
    --orbit-accent: var(--accent-color, var(--primary-color, #03a9f4));
    --orbit-accent-2: var(--info-color, var(--primary-color, #0288d1));
    --orbit-good: var(--success-color, #2e9d62);
    --orbit-warn: var(--warning-color, #c98500);
    --orbit-bad: var(--error-color, #d64545);
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    padding: 0;
    background: var(--orbit-bg);
    color: var(--orbit-text);
    isolation: isolate;
    font: inherit;
  }
  ha-card.orbit-card[data-theme="light"] { --orbit-bg: #ffffff; --orbit-surface: #f6f7f9; --orbit-line: rgba(32, 33, 36, .12); --orbit-text: #202124; --orbit-muted: #6b7280; --orbit-accent: #0288d1; --orbit-accent-2: #546e7a; }
  ha-card.orbit-card[data-theme="dark"] { --orbit-bg: #1c1c1e; --orbit-surface: #252529; --orbit-line: rgba(255, 255, 255, .1); --orbit-text: #f5f5f7; --orbit-muted: #a1a1aa; --orbit-accent: #64b5f6; --orbit-accent-2: #90a4ae; --orbit-good: #65c98b; --orbit-warn: #f2bd58; --orbit-bad: #f07171; }
  .noise, .noise::after { position: absolute; inset: 0; pointer-events: none; z-index: -1; }
  .noise { background: linear-gradient(135deg, color-mix(in srgb, var(--orbit-accent) 7%, transparent), transparent 44%); }
  .noise::after { content: ""; opacity: .32; background-image: linear-gradient(var(--orbit-line) 1px, transparent 1px), linear-gradient(90deg, var(--orbit-line) 1px, transparent 1px); background-size: 34px 34px; mask-image: linear-gradient(to bottom, black, transparent 78%); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 18px 20px 8px; }
  .eyebrow { color: var(--orbit-accent); font-size: .67rem; font-weight: 700; line-height: 1.2; letter-spacing: .12em; text-transform: uppercase; }
  h2, h3, p { margin: 0; }
  h2 { margin-top: 5px; font-size: clamp(1.1rem, 2vw, 1.35rem); letter-spacing: -.02em; }
  .subtitle { color: var(--orbit-muted); font-size: .78rem; margin-top: 5px; }
  .live { display: inline-flex; align-items: center; gap: 7px; padding: 6px 10px; border: 1px solid color-mix(in srgb, var(--orbit-good) 34%, var(--orbit-line)); border-radius: 999px; color: var(--orbit-good); background: color-mix(in srgb, var(--orbit-good) 10%, transparent); font-size: .72rem; font-weight: 700; white-space: nowrap; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 0 currentColor; animation: live-pulse 2s infinite; }
  .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; padding: 9px 20px 16px; }
  .stat { padding: 10px 11px; min-width: 0; border: 1px solid var(--orbit-line); border-radius: 12px; background: var(--orbit-surface); }
  .stat-label { color: var(--orbit-muted); font-size: .67rem; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat-value { margin-top: 5px; color: var(--orbit-text); font-size: 1rem; font-weight: 700; letter-spacing: -.015em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat-value.good { color: var(--orbit-good); }
  .stat-value.warn { color: var(--orbit-warn); }
  .muted { color: var(--orbit-muted); font-weight: 500; }
  .stage { position: relative; height: clamp(280px, 38vw, 390px); margin: 0 12px; overflow: hidden; border: 1px solid var(--orbit-line); border-radius: 16px; background: var(--orbit-surface); }
  .stage::before { content: ""; position: absolute; width: 47%; aspect-ratio: 1; left: 26.5%; top: 17%; border-radius: 50%; background: color-mix(in srgb, var(--orbit-accent) 10%, transparent); filter: blur(32px); animation: breathe 5s ease-in-out infinite; }
  .orbit-svg { position: absolute; inset: 2%; width: 96%; height: 96%; overflow: visible; }
  .orbit-ring { fill: none; stroke: var(--orbit-line); stroke-width: .3; stroke-dasharray: 1 2; transform-origin: 50px 50px; animation: orbit-spin 28s linear infinite; }
  .orbit-ring.two { stroke: color-mix(in srgb, var(--orbit-accent-2) 35%, var(--orbit-line)); animation-duration: 42s; animation-direction: reverse; }
  .orbit-ring.three { stroke: color-mix(in srgb, var(--orbit-accent) 25%, var(--orbit-line)); animation-duration: 66s; }
  .link { stroke: color-mix(in srgb, var(--orbit-accent-2) 42%, var(--orbit-line)); stroke-width: .24; stroke-dasharray: 1.2 1.4; animation: flow 2.8s linear infinite; }
  .link.offline { stroke: color-mix(in srgb, var(--orbit-bad) 60%, var(--orbit-line)); stroke-dasharray: .3 2.2; animation-duration: 7s; }
  .packet { fill: var(--orbit-accent); filter: drop-shadow(0 0 2px var(--orbit-accent)); animation: packet-travel 2.8s linear infinite; }
  .packet.p2 { animation-delay: -1.25s; fill: var(--orbit-accent-2); }
  .core { position: absolute; left: 50%; top: 50%; width: 108px; height: 108px; transform: translate(-50%, -50%); display: grid; place-items: center; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--orbit-accent) 55%, var(--orbit-line)); background: var(--orbit-bg); box-shadow: 0 0 0 8px color-mix(in srgb, var(--orbit-accent) 7%, transparent), 0 0 28px color-mix(in srgb, var(--orbit-accent) 20%, transparent), inset 0 0 18px color-mix(in srgb, var(--orbit-accent) 10%, transparent); z-index: 2; animation: core-float 5s ease-in-out infinite; }
  .core-inner { text-align: center; }
  .core-icon { color: var(--orbit-accent); font-size: 1.5rem; line-height: 1; }
  .core-name { margin-top: 6px; font-size: .68rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
  .core-meta { margin-top: 3px; color: var(--orbit-muted); font-size: .62rem; }
  .node { position: absolute; left: calc(var(--x) * 1%); top: calc(var(--y) * 1%); transform: translate(-50%, -50%); min-width: 87px; max-width: 118px; padding: 8px 9px; border: 1px solid var(--orbit-line); border-radius: 12px; background: var(--orbit-bg); box-shadow: 0 8px 20px color-mix(in srgb, var(--primary-text-color) 12%, transparent); cursor: pointer; z-index: 3; transition: transform .22s ease, border-color .22s ease, background .22s ease; animation: node-in .55s both; font: inherit; text-align: left; }
  .node:hover, .node.selected { transform: translate(-50%, -50%) scale(1.06); border-color: var(--orbit-accent); background: var(--orbit-surface); }
  .node-head { display: flex; align-items: center; gap: 6px; }
  .node-icon { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; background: color-mix(in srgb, var(--orbit-accent) 12%, transparent); color: var(--orbit-accent); font-size: .84rem; }
  .node.online .node-icon { box-shadow: 0 0 0 3px color-mix(in srgb, var(--orbit-good) 10%, transparent); }
  .node.offline .node-icon { color: var(--orbit-bad); background: color-mix(in srgb, var(--orbit-bad) 12%, transparent); }
  .node-name { min-width: 0; color: var(--orbit-text); font-size: .69rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .node-kind { margin-top: 5px; color: var(--orbit-muted); font-size: .6rem; text-transform: uppercase; letter-spacing: .06em; }
  .node-state { display: flex; align-items: center; gap: 4px; margin-top: 5px; color: var(--orbit-good); font-size: .61rem; }
  .node.offline .node-state { color: var(--orbit-bad); }
  .state-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .details { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; margin: 12px 12px 0; padding: 14px; border: 1px solid var(--orbit-line); border-radius: 14px; background: var(--orbit-surface); animation: reveal .3s ease both; }
  .details h3 { font-size: .86rem; }
  .detail-muted { margin-top: 3px; color: var(--orbit-muted); font-size: .68rem; }
  .metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; margin-top: 12px; }
  .metric { padding: 8px 9px; border-radius: 10px; background: var(--orbit-bg); border: 1px solid var(--orbit-line); }
  .metric-label { color: var(--orbit-muted); font-size: .61rem; }
  .metric-value { margin-top: 3px; color: var(--orbit-text); font-size: .76rem; font-weight: 700; overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; gap: 7px; align-content: flex-start; }
  .action { border: 1px solid color-mix(in srgb, var(--orbit-accent) 38%, var(--orbit-line)); border-radius: 9px; padding: 8px 10px; color: var(--orbit-accent); background: color-mix(in srgb, var(--orbit-accent) 9%, transparent); cursor: pointer; font: inherit; font-size: .68rem; }
  .action:hover { background: color-mix(in srgb, var(--orbit-accent) 16%, transparent); }
  .sparkline { display: block; width: 100%; height: 42px; margin-top: 10px; overflow: visible; }
  .sparkline polyline { fill: none; stroke: var(--orbit-accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .footer { display: flex; justify-content: space-between; gap: 12px; padding: 12px 20px 15px; color: var(--orbit-muted); font-size: .64rem; }
  .footer button { border: 0; padding: 0; color: var(--orbit-accent); background: none; cursor: pointer; font: inherit; }
  .empty { display: grid; place-items: center; min-height: 260px; padding: 28px; text-align: center; color: var(--orbit-muted); }
  .empty strong { display: block; margin-bottom: 8px; color: var(--orbit-text); font-size: .95rem; }
  .error { color: var(--orbit-bad); }
  @keyframes live-pulse { 0%, 100% { box-shadow: 0 0 0 0 currentColor; } 50% { box-shadow: 0 0 0 5px transparent; } }
  @keyframes breathe { 0%, 100% { transform: scale(.9); opacity: .55; } 50% { transform: scale(1.1); opacity: 1; } }
  @keyframes orbit-spin { to { transform: rotate(360deg); } }
  @keyframes flow { to { stroke-dashoffset: -5; } }
  @keyframes packet-travel { 0% { opacity: 0; offset-distance: 0%; } 12% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; offset-distance: 100%; } }
  @keyframes core-float { 0%, 100% { margin-top: 0; } 50% { margin-top: -4px; } }
  @keyframes node-in { from { opacity: 0; transform: translate(-50%, -50%) scale(.75); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  @keyframes reveal { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 560px) { .header { padding: 18px 17px 7px; } .summary { padding: 8px 17px 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); } .stage { margin: 0 9px; height: 320px; } .core { width: 90px; height: 90px; } .core-icon { font-size: 1.2rem; } .details { grid-template-columns: 1fr; margin: 10px 9px 0; } .footer { padding-inline: 17px; } .node { min-width: 76px; max-width: 98px; padding: 7px; } }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }
`;

class UnifiOrbitCard extends HTMLElement {
  constructor() {
    super();
    this._config = { ...DEFAULTS };
    this._hass = null;
    this._selectedDevice = null;
    this._samples = [];
    this._renderSignature = null;
    this._root = this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("UniFi Orbit: invalid configuration");
    this._config = {
      ...DEFAULTS,
      ...config,
      max_devices: Math.max(1, Math.min(24, Number(config.max_devices) || DEFAULTS.max_devices)),
      entities: Array.isArray(config.entities) ? config.entities : [],
      theme: ["auto", "light", "dark"].includes(config.theme) ? config.theme : DEFAULTS.theme,
    };
    this._renderSignature = null;
    this.render();
  }

  set hass(value) {
    this._hass = value;
    this.recordSample();
    this.render();
  }

  getCardSize() { return 7; }

  getGridOptions() {
    return { rows: 8, columns: 12, min_rows: 5 };
  }

  getConfigElement() {
    return document.createElement("unifi-orbit-card-editor");
  }

  getStubConfig() {
    return { ...DEFAULTS };
  }

  render() {
    if (!this._root || !this._hass) return;
    const data = this.collectData();
    const signature = this.renderSignature(data);
    if (this._renderSignature === signature && this._root.querySelector(".orbit-card")) {
      this.updateLiveData(data);
      return;
    }
    this._renderSignature = signature;
    this._root.innerHTML = `<style>${STYLES}</style>${this.renderCard(data)}`;
    this.bindEvents(data);
  }

  renderSignature(data) {
    const devices = data.devices.map((device) => ({
      id: device.id,
      name: device.name,
      model: device.model,
      kind: device.kind,
      actions: device.actions.map(({ entry }) => entry.entity_id),
    }));
    return JSON.stringify({
      title: this._config.title,
      theme: this._config.theme,
      max_devices: this._config.max_devices,
      show_clients: this._config.show_clients,
      show_traffic: this._config.show_traffic,
      show_updates: this._config.show_updates,
      selected: this._selectedDevice,
      entries: data.entries.map(({ entry }) => entry.entity_id),
      devices,
    });
  }

  updateLiveData(data) {
    const total = data.devices.length;
    const status = total && data.online === total ? "All systems nominal" : total ? `${data.online}/${total} nodes online` : "Waiting for UniFi entities";
    const setText = (selector, value) => {
      const element = this._root.querySelector(selector);
      if (element) element.textContent = value;
    };
    const setClass = (selector, className) => {
      const element = this._root.querySelector(selector);
      if (element) element.className = className;
    };

    setText('[data-bind="subtitle"]', status);
    setText('[data-bind="live-label"]', data.online ? "LIVE" : "STANDBY");
    setText('[data-bind="nodes"]', `${data.online} / ${total}`);
    setText('[data-bind="clients"]', this.formatNumber(data.clients));
    setText('[data-bind="rx"]', this.rate(data.traffic.rx));
    setText('[data-bind="tx"]', this.rate(data.traffic.tx));
    setText('[data-bind="updates"]', data.updates ? `${data.updates} ready` : "Up to date");
    setText('[data-bind="entries"]', `${data.entries.length} entities observed · local state only`);
    setClass('[data-bind="nodes"]', `stat-value ${data.online === total && total ? "good" : ""}`);
    setClass('[data-bind="updates"]', `stat-value ${data.updates ? "warn" : "good"}`);

    for (const device of data.devices) {
      const node = this._root.querySelector(`[data-device="${this.escapeSelector(device.id)}"]`);
      if (!node) continue;
      node.classList.remove("online", "offline", "pending", "provisioning", "upgrading", "unknown");
      node.classList.add(device.status);
      const state = node.querySelector("[data-node-state]");
      if (state) state.textContent = device.status;
    }

    const selected = data.devices.find((device) => device.id === this._selectedDevice);
    const detailStatus = this._root.querySelector("[data-detail-status]");
    if (detailStatus && selected) detailStatus.textContent = `${selected.model} · ${selected.status}`;
  }

  escapeSelector(value) {
    return String(value ?? "").replace(/([\\"'\[\]#.:>+~*(),=])/g, "\\$1");
  }

  collectData() {
    const states = this._hass?.states || {};
    const registry = Object.values(this._hass?.entities || {});
    const selectedIds = new Set(this._config.entities);
    const autoDiscover = this._config.auto_discover !== false && selectedIds.size === 0;
    const entries = registry.length
      ? registry.filter((entry) => autoDiscover ? entry.platform === "unifi" : selectedIds.has(entry.entity_id))
      : Object.keys(states).filter((entityId) => selectedIds.has(entityId) || (autoDiscover && this.isFallbackUnifiEntity(entityId, states[entityId]))).map((entity_id) => ({ entity_id }));
    const stateEntries = entries.map((entry) => ({ entry, state: states[entry.entity_id] })).filter((item) => item.state);
    const devices = this.collectDevices(stateEntries);
    const clients = this.collectClients(stateEntries);
    const traffic = this.collectTraffic(stateEntries);
    const updates = stateEntries.filter(({ entry }) => entry.entity_id.startsWith("update.") && states[entry.entity_id]?.state === "on").length;
    const online = devices.filter((device) => device.status === "online").length;
    return { entries: stateEntries, devices, clients, traffic, updates, online };
  }

  collectDevices(items) {
    const devicesById = new Map();
    for (const { entry } of items) {
      if (entry.device_id && this._hass.devices?.[entry.device_id]) {
        const device = this._hass.devices[entry.device_id];
        const isHardware = /ubiquiti|unifi/i.test(`${device.manufacturer || ""} ${device.model || ""}`) || this.hasHardwareTelemetry(items, entry.device_id);
        if (!isHardware) continue;
        if (!devicesById.has(entry.device_id)) devicesById.set(entry.device_id, { id: entry.device_id, registry: device, entities: [] });
        devicesById.get(entry.device_id).entities.push(entry.entity_id);
      }
    }
    let devices = [...devicesById.values()].map((device) => this.decorateDevice(device, items));
    if (!devices.length) {
      const fallback = items.filter(({ entry }) => /device_(state|uptime|cpu|memory|temperature|clients)/i.test(`${entry.translation_key || ""} ${entry.entity_id}`));
      const grouped = new Map();
      for (const item of fallback) {
        const label = this.entityName(item.state, item.entry).replace(/\s+(device state|uptime|cpu.*|memory.*|temperature|clients)$/i, "");
        if (!grouped.has(label)) grouped.set(label, []);
        grouped.get(label).push(item.entry.entity_id);
      }
      devices = [...grouped].map(([label, entityIds], index) => this.decorateDevice({ id: `fallback-${index}`, registry: { name: label, model: "UniFi device" }, entities: entityIds }, items));
    }
    return devices.slice(0, this._config.max_devices);
  }

  hasHardwareTelemetry(items, deviceId) {
    return items.some(({ entry }) => entry.device_id === deviceId && /device_(state|uptime|cpu|memory|temperature)|port_|poe_/i.test(`${entry.translation_key || ""} ${entry.entity_id}`));
  }

  decorateDevice(device, items) {
    const registry = device.registry || {};
    const linked = items.filter(({ entry }) => device.entities.includes(entry.entity_id));
    const model = registry.model || this.valueFor(linked, /model/i) || "UniFi device";
    const name = registry.name_by_user || registry.name || this.entityName(linked[0]?.state, linked[0]?.entry) || model;
    const kind = this.kindFor(`${name} ${model} ${linked.map(({ entry }) => entry.entity_id).join(" ")}`);
    const statusEntity = this.findEntity(linked, ["device_state"], /device_state|device_tracker/);
    const status = this.statusFor(statusEntity?.state);
    const metrics = this.metricsFor(linked);
    const actions = linked.filter(({ entry }) => /^(button|switch)\./.test(entry.entity_id) && /restart|power_cycle|poe|port_control|wlan_control|block_client/i.test(`${entry.translation_key || ""} ${entry.entity_id}`));
    return { ...device, name, model, kind, status, metrics, actions, linked };
  }

  collectClients(items) {
    const wlan = this.sumBy(items, /wlan_clients/i);
    const deviceClients = this.sumBy(items, /device_clients/i);
    if (wlan || deviceClients) return Math.round(wlan || deviceClients);
    return items.filter(({ entry, state }) => entry.entity_id.startsWith("device_tracker.") && state.state === "home" && !entry.device_id).length;
  }

  collectTraffic(items) {
    let rx = this.sumRate(items, /client_bandwidth_rx|bandwidth.*rx/i);
    let tx = this.sumRate(items, /client_bandwidth_tx|bandwidth.*tx/i);
    if (!rx && !tx) {
      rx = this.sumRate(items, /port_bandwidth_rx|port.*rx/i);
      tx = this.sumRate(items, /port_bandwidth_tx|port.*tx/i);
    }
    return { rx, tx, total: rx + tx };
  }

  metricsFor(items) {
    const definitions = [
      ["Clients", /device_clients|wlan_clients/i],
      ["CPU", /cpu_utilization|cpu.*util/i],
      ["Memory", /memory_utilization|memory.*util/i],
      ["Temperature", /device_temperature|temperature/i],
      ["Uptime", /device_uptime|uptime/i],
    ];
    return definitions.map(([label, pattern]) => {
      const item = this.findEntity(items, [], pattern);
      return item ? { label, value: this.displayState(item.state) } : null;
    }).filter(Boolean);
  }

  findEntity(items, exactKeys, pattern) {
    return items.find(({ entry }) => exactKeys.includes(entry.translation_key) || pattern?.test(`${entry.translation_key || ""} ${entry.entity_id}`));
  }

  sumBy(items, pattern) {
    return items.filter(({ entry }) => pattern.test(`${entry.translation_key || ""} ${entry.entity_id}`)).reduce((sum, { state }) => sum + this.numeric(state?.state), 0);
  }

  sumRate(items, pattern) {
    return items.filter(({ entry }) => pattern.test(`${entry.translation_key || ""} ${entry.entity_id}`)).reduce((sum, { state }) => sum + this.toMbps(state), 0);
  }

  recordSample() {
    if (!this._hass) return;
    const now = Date.now();
    if (this._samples.length && now - this._samples[this._samples.length - 1].time < 8000) return;
    const data = this.collectData();
    this._samples.push({ time: now, value: data.traffic.total });
    this._samples = this._samples.slice(-24);
  }

  renderCard(data) {
    const total = data.devices.length;
    const status = total && data.online === total ? "All systems nominal" : total ? `${data.online}/${total} nodes online` : "Waiting for UniFi entities";
    const stage = total ? this.renderStage(data) : `<div class="empty"><div><strong>No UniFi entities detected</strong>Enable the UniFi Network integration or add entities explicitly in the card editor.</div></div>`;
    const selected = data.devices.find((device) => device.id === this._selectedDevice);
    return `<ha-card class="orbit-card" data-theme="${this.escape(this._config.theme || "auto")}" data-ha-theme="${this.escape(this._config.theme || "auto")}">
      <div class="noise"></div>
      <div class="header"><div><div class="eyebrow">Network observatory · v${CARD_VERSION}</div><h2>${this.escape(this._config.title)}</h2><div class="subtitle" data-bind="subtitle">${this.escape(status)}</div></div><div class="live"><span class="live-dot"></span><span data-bind="live-label">${data.online ? "LIVE" : "STANDBY"}</span></div></div>
      <div class="summary">
        <div class="stat"><div class="stat-label">Nodes</div><div data-bind="nodes" class="stat-value ${data.online === total && total ? "good" : ""}">${data.online} / ${total}</div></div>
        ${this._config.show_clients ? `<div class="stat"><div class="stat-label">Active clients</div><div data-bind="clients" class="stat-value">${this.formatNumber(data.clients)}</div></div>` : ""}
        ${this._config.show_traffic ? `<div class="stat"><div class="stat-label">Traffic</div><div class="stat-value">↓ <span data-bind="rx">${this.rate(data.traffic.rx)}</span> <span class="muted">↑ <span data-bind="tx">${this.rate(data.traffic.tx)}</span></span></div></div>` : ""}
        ${this._config.show_updates ? `<div class="stat"><div class="stat-label">Firmware</div><div data-bind="updates" class="stat-value ${data.updates ? "warn" : "good"}">${data.updates ? `${data.updates} ready` : "Up to date"}</div></div>` : ""}
      </div>
      ${stage}
      ${selected ? this.renderDetails(selected) : ""}
      <div class="footer"><span data-bind="entries">${data.entries.length} entities observed · local state only</span><button data-clear-selection>${selected ? "Close details" : "Auto-discovery active"}</button></div>
    </ha-card>`;
  }

  renderStage(data) {
    const center = { x: 50, y: 50 };
    const positions = this.positions(data.devices.length);
    const links = data.devices.map((device, index) => {
      const point = positions[index];
      const line = `<line class="link ${device.status === "offline" ? "offline" : ""}" x1="50" y1="50" x2="${point.x}" y2="${point.y}" pathLength="1" />`;
      return `${line}<circle class="packet" cx="50" cy="50" r=".65"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 0 0 L ${point.x - 50} ${point.y - 50}" /></circle><circle class="packet p2" cx="50" cy="50" r=".45"><animateMotion dur="2.8s" begin="-1.25s" repeatCount="indefinite" path="M 0 0 L ${point.x - 50} ${point.y - 50}" /></circle>`;
    }).join("");
    const nodes = data.devices.map((device, index) => {
      const point = positions[index];
      const selected = device.id === this._selectedDevice ? " selected" : "";
      return `<button class="node ${device.status}${selected}" data-device="${this.escape(device.id)}" style="--x:${point.x};--y:${point.y};animation-delay:${index * 55}ms" aria-label="${this.escape(device.name)}">
        <span class="node-head"><span class="node-icon">${this.iconFor(device.kind)}</span><span class="node-name">${this.escape(device.name)}</span></span><span class="node-kind">${this.escape(device.kind)}</span><span class="node-state"><span class="state-dot"></span><span data-node-state>${this.escape(device.status)}</span></span>
      </button>`;
    }).join("");
    return `<div class="stage"><svg class="orbit-svg" viewBox="0 0 100 100" aria-hidden="true"><circle class="orbit-ring" cx="50" cy="50" r="26"/><circle class="orbit-ring two" cx="50" cy="50" r="38"/><circle class="orbit-ring three" cx="50" cy="50" r="46"/>${links}</svg><div class="core"><div class="core-inner"><div class="core-icon">⌁</div><div class="core-name">UniFi</div><div class="core-meta">controller pulse</div></div></div>${nodes}</div>`;
  }

  renderDetails(device) {
    const metrics = device.metrics.length ? device.metrics.map((metric) => `<div class="metric"><div class="metric-label">${this.escape(metric.label)}</div><div class="metric-value">${this.escape(metric.value)}</div></div>`).join("") : `<div class="detail-muted">No optional telemetry is enabled for this node.</div>`;
    const actions = device.actions.length ? device.actions.map(({ entry }) => {
      const domain = entry.entity_id.split(".")[0];
      const label = domain === "button" ? this.friendlyAction(entry) : `Toggle ${this.friendlyAction(entry)}`;
      return `<button class="action" data-action-domain="${domain}" data-action-entity="${this.escape(entry.entity_id)}">${this.escape(label)}</button>`;
    }).join("") : `<div class="detail-muted">No control entities available.</div>`;
    return `<section class="details"><div><h3>${this.escape(device.name)}</h3><div class="detail-muted" data-detail-status>${this.escape(device.model)} · ${this.escape(device.status)}</div><div class="metrics">${metrics}</div>${this.renderSparkline()}</div><div><h3>Actions</h3><div class="detail-muted">Only entities exposed by your UniFi permissions appear here.</div><div class="actions" style="margin-top:12px">${actions}</div></div></section>`;
  }

  renderSparkline() {
    if (!this._config.show_traffic || this._samples.length < 2) return "";
    const values = this._samples.map((sample) => sample.value);
    const max = Math.max(...values, 1);
    const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${40 - (value / max) * 34}`).join(" ");
    return `<svg class="sparkline" viewBox="0 0 100 42" preserveAspectRatio="none" aria-label="Traffic trend"><polyline points="${points}"/></svg>`;
  }

  bindEvents(data) {
    this._root.querySelectorAll("[data-device]").forEach((node) => node.addEventListener("click", () => {
      this._selectedDevice = node.dataset.device === this._selectedDevice ? null : node.dataset.device;
      this._renderSignature = null;
      this.render();
    }));
    this._root.querySelectorAll("[data-action-entity]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      const entityId = button.dataset.actionEntity;
      const domain = button.dataset.actionDomain;
      if (!this._hass?.callService || !entityId) return;
      this._hass.callService(domain, domain === "button" ? "press" : "toggle", { entity_id: entityId });
    }));
    this._root.querySelector("[data-clear-selection]")?.addEventListener("click", () => { this._selectedDevice = null; this._renderSignature = null; this.render(); });
  }

  positions(count) {
    const points = [];
    const radius = count <= 4 ? 35 : count <= 8 ? 41 : 44;
    for (let i = 0; i < count; i += 1) {
      const angle = (-Math.PI / 2) + ((Math.PI * 2) / count) * i;
      points.push({ x: +(50 + Math.cos(angle) * radius).toFixed(2), y: +(50 + Math.sin(angle) * radius).toFixed(2) });
    }
    return points;
  }

  kindFor(value) {
    if (/gateway|udm|usg|uxg|ucg|dream router|router/i.test(value)) return "gateway";
    if (/access point|\buap\b|\bu6\b|\bu7\b|beacon|wifi|wireless|mesh/i.test(value)) return "access point";
    if (/switch|\busw\b|\bus\d|port|poe/i.test(value)) return "switch";
    return "device";
  }

  iconFor(kind) { return kind === "gateway" ? "◈" : kind === "access point" ? "◉" : kind === "switch" ? "▦" : "◇"; }

  statusFor(state) {
    const raw = String(state?.state || "unknown").toLowerCase();
    return STATUS_WORDS[raw] || (/connected|online|home|on/.test(raw) ? "online" : /offline|disconnect|unavailable/.test(raw) ? "offline" : raw);
  }

  displayState(state) {
    if (!state) return "—";
    const value = state.state;
    const unit = state.attributes?.unit_of_measurement;
    if (value === "unknown" || value === "unavailable") return value;
    return `${value}${unit ? ` ${unit}` : ""}`;
  }

  entityName(state, entry) { return state?.attributes?.friendly_name || entry?.name || entry?.entity_id || "UniFi"; }
  friendlyAction(entry) { return String(entry.translation_key || entry.entity_id.split(".").pop()).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
  numeric(value) { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) ? parsed : 0; }

  toMbps(state) {
    const value = this.numeric(state?.state);
    const unit = String(state?.attributes?.unit_of_measurement || "").toLowerCase().replaceAll(" ", "");
    if (unit === "b/s" || unit.includes("byte/s") || unit.includes("bytes/s")) return value / 125000;
    if (unit.includes("mb/s") || unit.includes("megabyte")) return value * 8;
    if (unit.includes("kb/s") || unit.includes("kilobyte")) return value / 125;
    if (unit.includes("bit/s") || unit.includes("mbit") || unit.includes("megabit")) return value;
    return value;
  }

  rate(value) { return value >= 1000 ? `${(value / 1000).toFixed(1)} Gbps` : `${value.toFixed(value < 10 ? 1 : 0)} Mbps`; }
  formatNumber(value) { return new Intl.NumberFormat(this._hass?.locale?.language || undefined, { maximumFractionDigits: 0 }).format(value); }

  isFallbackUnifiEntity(entityId, state) {
    const value = `${entityId} ${state?.attributes?.friendly_name || ""}`;
    return /unifi|ubiquiti|\budm\b|\busw\b|\buap\b|\bucg\b|\buxg\b|device_(state|uptime|cpu|memory|temperature|clients)|wlan_clients|poe_port|port_bandwidth/i.test(value);
  }

  escape(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
}

class UnifiOrbitCardEditor extends HTMLElement {
  constructor() { super(); this._root = this.attachShadow({ mode: "open" }); this._config = {}; }
  setConfig(config) { this._config = { ...DEFAULTS, ...config }; this.render(); }
  render() {
    this._root.innerHTML = `<style>:host{display:block;padding:8px 0;font-family:var(--paper-font-common-base_-_font-family,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)} .form{display:grid;gap:14px} label{display:grid;gap:5px;color:var(--primary-text-color);font-size:.85rem} input,select{box-sizing:border-box;width:100%;padding:9px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color);font:inherit} .check{display:flex;grid-template-columns:auto 1fr;align-items:center;gap:8px}.check input{width:auto}</style><div class="form"><label>Title<input data-key="title" value="${this.escape(this._config.title)}"></label><label>Theme<select data-key="theme"><option value="auto">Follow Home Assistant</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Maximum nodes<input data-key="max_devices" type="number" min="1" max="24" value="${this._config.max_devices}"></label><label class="check"><input data-key="auto_discover" type="checkbox" ${this._config.auto_discover !== false ? "checked" : ""}> Auto-discover UniFi entities</label><label class="check"><input data-key="show_clients" type="checkbox" ${this._config.show_clients !== false ? "checked" : ""}> Show active clients</label><label class="check"><input data-key="show_traffic" type="checkbox" ${this._config.show_traffic !== false ? "checked" : ""}> Show traffic and trend</label><label class="check"><input data-key="show_updates" type="checkbox" ${this._config.show_updates !== false ? "checked" : ""}> Show firmware status</label><p style="margin:0;color:var(--secondary-text-color);font-size:.78rem">Auto follows Home Assistant colors and typography. Use an explicit entity list only when registry discovery is unavailable.</p></div>`;
    const theme = this._root.querySelector('[data-key="theme"]'); if (theme) theme.value = this._config.theme;
    this._root.querySelectorAll("[data-key]").forEach((input) => input.addEventListener("change", () => this.changeConfig()));
  }
  changeConfig() {
    const next = { ...this._config };
    this._root.querySelectorAll("[data-key]").forEach((input) => { next[input.dataset.key] = input.type === "checkbox" ? input.checked : input.type === "number" ? Number(input.value) : input.value; });
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
  escape(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
}

if (!customElements.get("unifi-orbit-card")) customElements.define("unifi-orbit-card", UnifiOrbitCard);
if (!customElements.get("unifi-orbit-card-editor")) customElements.define("unifi-orbit-card-editor", UnifiOrbitCardEditor);

export { UnifiOrbitCard };
