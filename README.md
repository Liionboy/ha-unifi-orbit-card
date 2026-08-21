# UniFi Orbit Card

An animated Home Assistant Lovelace card for the official UniFi Network integration.

UniFi Orbit renders the network as a living observatory: gateways, access points, and switches appear as orbiting nodes around a controller pulse. Links flow, packets travel between nodes, and the card adapts to the entities that are actually available in each Home Assistant installation.

## Why it is generic

The card does not contain any personal entity IDs. It discovers UniFi entities through Home Assistant's entity registry (`platform: unifi`) and correlates them with the device registry. It also has a conservative fallback for older Home Assistant versions and supports an explicit `entities` list when registry data is unavailable.

Optional entities are truly optional. The card can use any combination of:

- UniFi device state, uptime, CPU, memory, and temperature sensors
- WLAN and device client sensors
- Client and port bandwidth sensors
- UniFi device trackers
- Restart, PoE power-cycle, port, WLAN, and client-control entities
- Firmware update entities

The exact set depends on the UniFi model, Home Assistant options, and the permissions of the local UniFi user.

## Installation with HACS

This repository is a HACS Dashboard plugin.

1. Open HACS → Frontend.
2. Search for **UniFi Orbit Card** and install it.
3. Reload the browser after installation.
4. Add the card from the dashboard card picker.

Until the repository has been accepted into the HACS default catalog, add the GitHub repository as a custom repository with category **Dashboard**.

For a local/manual install, copy `unifi-orbit-card.js` to `/config/www/` and add it under **Settings → Dashboards → Resources** as a JavaScript module.

## Basic configuration

The card is intentionally usable with no entity configuration:

```yaml
type: custom:unifi-orbit-card
title: UniFi Orbit
```

The visual editor exposes the common settings:

```yaml
type: custom:unifi-orbit-card
title: Home Network
theme: aurora # aurora, ember, mono
auto_discover: true
max_devices: 8
show_clients: true
show_traffic: true
show_updates: true
```

If automatic registry discovery is not available, use a list of UniFi entity IDs:

```yaml
type: custom:unifi-orbit-card
auto_discover: false
entities:
  - sensor.udm_pro_device_state
  - sensor.udm_pro_cpu_utilization
  - sensor.udm_pro_memory_utilization
  - sensor.udm_pro_device_clients
  - button.udm_pro_restart
```

An explicit list is also useful for a focused card that shows only one site or a subset of devices.

## Design notes

- All data comes from the Home Assistant frontend state object; the card never connects directly to UniFi and never handles credentials.
- Actions are sent through Home Assistant services (`button.press` or `switch.toggle`) only for entities already exposed by the UniFi integration.
- The traffic sparkline is a lightweight in-memory session trend, not a database or history query.
- `prefers-reduced-motion` is respected for accessibility.
- Missing telemetry results in a smaller details panel instead of a broken card.

## Development

The first version deliberately ships as a dependency-free JavaScript module. This keeps HACS installation simple and avoids bundling a second copy of Home Assistant's frontend dependencies.

```bash
npm run check
```

Before publishing, create a GitHub release and validate the repository with HACS.

## License

MIT
