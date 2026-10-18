# Strata Framework

> A custom FiveM roleplay server framework built for team development. Includes a full suite of systems — characters, jobs, economy, housing, vehicles, crime, police, and more.

---

## Table of Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Resources](#resources)
- [Configuration](#configuration)
- [Development](#development)

---

## Requirements

| Dependency | Notes |
|---|---|
| [FXServer](https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/) | Extract into `artifacts/` |
| [MariaDB / MySQL](https://mariadb.org/) | Run `database.sql` to set up the schema |
| [Node.js](https://nodejs.org/) v18+ | Required for building NUI resources |
| [txAdmin](https://aka.cfx.re/txadmin) | Bundled with FXServer |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Strata-FiveM/strata-fivem.git
cd strata-fivem
```

### 2. Download FXServer

Download the latest FXServer artifacts from [runtime.fivem.net](https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/) and extract them into the `artifacts/` folder.

### 3. Set up the database

```sql
CREATE DATABASE `strata-framework`;
```

```bash
mysql -u root -p strata-framework < database.sql
```

Update the connection string in `server/config/database.cfg` if needed.

### 4. Configure secrets

```bash
cp server/config/secrets.example.cfg server/config/secrets.cfg
```

Fill in your:
- `sv_licenseKey` — from [keymaster.fivem.net](https://keymaster.fivem.net)
- `steam_webApiKey` — from [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)

### 5. Build NUI resources

Build output is gitignored — every NUI resource must be built before use:

```bash
cd server/resources/[strata]/<resource-name>/ui
npm install && npm run build
```

### 6. Start the server

```bash
./artifacts/FXServer.exe +exec server/server.cfg
```

---

## Project Structure

```
strata-fivem/
├── artifacts/               # FXServer binaries (gitignored — download separately)
├── database.sql             # Full database schema
├── server/
│   ├── server.cfg           # Main server config (loads all sub-configs)
│   ├── config/
│   │   ├── secrets.cfg      # Gitignored — copy from secrets.example.cfg
│   │   ├── secrets.example.cfg
│   │   ├── database.cfg
│   │   ├── resources.cfg    # Resource load order
│   │   ├── permissions.cfg  # ACE permissions & staff list
│   │   ├── core.cfg         # Core framework settings
│   │   ├── ox.cfg
│   │   ├── voice.cfg
│   │   └── webhooks.cfg
│   └── resources/
│       ├── [strata]/        # All custom Strata resources (st_*)
│       ├── [ox]/            # ox_lib, oxmysql
│       ├── [assets]/        # Map and asset packs
│       └── [cfx-default]/   # mapmanager, spawnmanager, yarn
```

---

## Resources

### Core
| Resource | Description |
|---|---|
| `strata` | Shared framework — player/character classes, groups, callbacks, middleware, logging |
| `st_bootstrap` | Loadscreen with progress tracking, tips, and priority queue display |
| `st_chars` | Character creation and selection |
| `st_appearance` | Ped customisation, clothing, tattoos, barber |
| `st_queue` | Connection queue with priority support |
| `st_admin` | Admin panel and staff tools |
| `st_chat` | Custom chat system with command support |
| `st_menu` | Radial/context menu system |
| `st_ui` | HUD — health, armor, hunger, thirst, speed, minimap |
| `st_utils` | Shared client/server utilities (anticheat, capture, escort, IPL, lasers, ped interaction, scenes, status, sync) |
| `st_binds` | Keybind registration and management |
| `st_zones` | Zone creation (box, circle, poly) and PvP zone management |
| `st_target` | Interaction targeting system |
| `st_props` | Shared prop and object placement library |
| `st_sound` | Shared sound library |
| `st_minigames` | Shared minigame library |
| `st_debug` | Developer tools and debug overlays |
| `st_webapi` | External web API bridge |

### Inventory
| Resource | Description |
|---|---|
| `st_inventory` | Slot-based inventory with item metadata, back items, drag-to-craft, and item carry |

### Economy & Business
| Resource | Description |
|---|---|
| `st_finance` | Banking, ATMs, and money management |
| `st_business` | Business ownership, management, and restaurant system |
| `st_showroom` | Vehicle dealership system |

### Jobs
| Resource | Description |
|---|---|
| `st_jobs` | Job framework, whitelist, and general labour jobs |
| `st_police` | Police, EMS, government, handcuffs, prison, and speed radar |
| `st_mdt` | Mobile data terminal for law enforcement |
| `st_cameras` | CCTV camera network for police |
| `st_autoshop` | Mechanic job and vehicle customisation |

### Vehicles
| Resource | Description |
|---|---|
| `st_veh` | Vehicle ownership, garages, and sync |
| `st_stance` | Wheel fitment and stance |
| `st_fuel` | Fuel system |

### Housing & Property
| Resource | Description |
|---|---|
| `st_housing` | Property ownership system |
| `st_apartment` | Apartment system |
| `st_elevators` | Elevator system |

### Crime
| Resource | Description |
|---|---|
| `st_crime` | Robbery, capture, and criminal activity |
| `st_drugs` | Drug production, weed growing, and dealing |
| `st_forensics` | Evidence collection and forensics |
| `st_jail` | Jail and sentencing system |
| `st_injury` | Damage, injury, and medical system |

### Communication
| Resource | Description |
|---|---|
| `st_phone` | In-game smartphone |
| `st_tablet` | In-game tablet |
| `st_voip` | Proximity voice chat |
| `st_radio` | Radio communication system |

### Entertainment
| Resource | Description |
|---|---|
| `st_gamble` | Casino games |
| `st_music` | DJ booth and music system |
| `st_billboards` | Controllable in-game billboards |
| `st_emotes` | Animation and emote library |

---

## Configuration

All server configuration lives in `server/config/`:

| File | Purpose |
|---|---|
| `secrets.cfg` | License key and API keys (gitignored) |
| `database.cfg` | MySQL connection string |
| `resources.cfg` | Resource start order |
| `permissions.cfg` | ACE permissions and staff identifiers |
| `core.cfg` | Core framework settings |
| `ox.cfg` | Inventory slots, weight, and feature flags |
| `voice.cfg` | VOIP settings |
| `webhooks.cfg` | Discord webhook endpoints |

---

## Development

### UI stack

Every NUI resource uses the same stack — no exceptions:

| Layer | Choice |
|---|---|
| Build | Vite |
| Language | TypeScript (strict) |
| Framework | React 18 |
| Styling | Tailwind CSS |
| State | Zustand |
| Icons | Lucide React |

Source lives in `ui/src/`. Build output goes to `ui/dist/` and is gitignored — run `npm run build` after every change.

### Building a NUI resource

```bash
cd server/resources/[strata]/<resource-name>/ui
npm install
npm run build
```

---

*Built and maintained by the Strata development team.*
