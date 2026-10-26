/**
 * ============================================================================
 * Beregost Time Loop Companion - Automated Frontend & Logic Test Suite
 * ============================================================================
 * Runs 9 comprehensive test suites with zero external npm dependencies.
 * Usage: node tests/run_tests.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// ANSI Color Codes for Terminal Output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m"
};

// Global Test Runner State
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let totalAssertions = 0;
const testResults = [];

function suite(suiteName, fn) {
  console.log(`\n${colors.bold}${colors.cyan}▶ SUITE: ${suiteName}${colors.reset}`);
  fn();
}

function test(testName, fn) {
  totalTests++;
  const startTime = Date.now();
  try {
    fn();
    const duration = Date.now() - startTime;
    passedTests++;
    testResults.push({ name: testName, status: 'PASS', duration });
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${testName} ${colors.gray}(${duration}ms)${colors.reset}`);
  } catch (err) {
    const duration = Date.now() - startTime;
    failedTests++;
    testResults.push({ name: testName, status: 'FAIL', duration, error: err.message });
    console.log(`  ${colors.red}✖ FAIL${colors.reset} ${testName}`);
    console.log(`    ${colors.red}${err.message}${colors.reset}`);
  }
}

function expect(condition, message) {
  totalAssertions++;
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// ----------------------------------------------------------------------------
// 1. Load index.html and Initialize Virtual DOM Sandbox
// ----------------------------------------------------------------------------
const htmlPath = path.resolve(__dirname, '../index.html');
expect(fs.existsSync(htmlPath), "index.html must exist in workspace root");
const html = fs.readFileSync(htmlPath, 'utf8');

// Lightweight Virtual DOM Mock
const elementsStore = {};
function getOrCreateElement(id) {
  if (!elementsStore[id]) {
    const classSet = new Set();
    elementsStore[id] = {
      id: id,
      innerHTML: '',
      textContent: '',
      value: '360',
      style: {},
      attributes: {},
      classList: {
        add: (cls) => classSet.add(cls),
        remove: (cls) => classSet.delete(cls),
        toggle: (cls, force) => {
          if (force !== undefined) {
            if (force) classSet.add(cls); else classSet.delete(cls);
            return force;
          }
          if (classSet.has(cls)) { classSet.delete(cls); return false; }
          classSet.add(cls); return true;
        },
        contains: (cls) => classSet.has(cls)
      },
      setAttribute: (k, v) => { elementsStore[id].attributes[k] = v; },
      getAttribute: (k) => elementsStore[id].attributes[k] || null,
      appendChild: (child) => {},
      scrollIntoView: () => {},
      addEventListener: () => {}
    };
  }
  return elementsStore[id];
}

const sandbox = {
  console: console,
  document: {
    getElementById: (id) => getOrCreateElement(id),
    querySelectorAll: (selector) => {
      return [];
    },
    querySelector: (selector) => null,
    createElement: (tag) => getOrCreateElement('elem_' + Math.random()),
    createElementNS: (ns, tag) => getOrCreateElement('elem_ns_' + Math.random()),
    addEventListener: () => {}
  },
  window: {
    addEventListener: () => {}
  },
  localStorage: {
    _data: {},
    getItem: function(key) { return this._data[key] || null; },
    setItem: function(key, val) { this._data[key] = String(val); },
    removeItem: function(key) { delete this._data[key]; },
    clear: function() { this._data = {}; }
  },
  navigator: {
    clipboard: { writeText: () => Promise.resolve() }
  },
  alert: () => {},
  prompt: () => null
};

// Extract JavaScript from index.html and evaluate in VM
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
expect(scriptMatch, "Script block must exist in index.html");
const scriptCode = scriptMatch[1];

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

// Expose globals for direct testing
const getGlobal = (name) => vm.runInContext(name, sandbox);

// ----------------------------------------------------------------------------
// SUITE 1: DOM Navigation & Tab Layout
// ----------------------------------------------------------------------------
suite("1. Core Navigation & Tab Architecture", () => {
  const tabs = [
    "tab-roadmap", "tab-timeline", "tab-loop0", "tab-memory", "tab-dag", "tab-bosses",
    "tab-rakshasa", "tab-map", "tab-town", "tab-dungeons", "tab-gallery", "tab-notebook", "tab-party", "tab-ingest", "tab-todo"
  ];

  test("All 15 Tab Panes exist in HTML markup", () => {
    tabs.forEach(tabId => {
      expect(html.includes(`id="${tabId}"`), `Markup missing tab element #${tabId}`);
    });
  });

  test("switchTab() properly updates active tab classes", () => {
    const switchTab = getGlobal('switchTab');
    expect(typeof switchTab === 'function', "switchTab must be a global function");

    // Switch to tab-map
    switchTab('tab-map');
    const mapEl = sandbox.document.getElementById('tab-map');
    expect(mapEl.classList.contains('active'), "tab-map should have 'active' class");

    // Switch to tab-memory
    switchTab('tab-memory');
    const memEl = sandbox.document.getElementById('tab-memory');
    expect(memEl.classList.contains('active'), "tab-memory should have 'active' class");

    // Switch to tab-town
    switchTab('tab-town');
    const townEl = sandbox.document.getElementById('tab-town');
    expect(townEl.classList.contains('active'), "tab-town should have 'active' class");

    // Switch to tab-dungeons
    switchTab('tab-dungeons');
    const dungeonEl = sandbox.document.getElementById('tab-dungeons');
    expect(dungeonEl.classList.contains('active'), "tab-dungeons should have 'active' class");

    // Switch to tab-gallery
    switchTab('tab-gallery');
    const galleryEl = sandbox.document.getElementById('tab-gallery');
    expect(galleryEl.classList.contains('active'), "tab-gallery should have 'active' class");

    // Switch to tab-todo
    switchTab('tab-todo');
    const todoEl = sandbox.document.getElementById('tab-todo');
    expect(todoEl.classList.contains('active'), "tab-todo should have 'active' class");
  });
});

// ----------------------------------------------------------------------------
// SUITE 2: Master Data Integrity & Schemas
// ----------------------------------------------------------------------------
suite("2. Master Data Schemas & Relational Integrity", () => {
  const fullHexData = getGlobal('FULL_HEX_DATA');
  const npcData = getGlobal('MASTER_NPC_DATA');
  const capstones = getGlobal('CAPSTONE_ITEMS_DATA');
  const dungeons = getGlobal('DUNGEON_DATA');
  const buildings = getGlobal('BEREGOST_BUILDINGS');
  const monsters = getGlobal('MONSTER_STAT_BLOCKS');

  test("FULL_HEX_DATA contains exactly 380 hexes with Dijkstra traversal costs", () => {
    expect(Array.isArray(fullHexData), "FULL_HEX_DATA must be an array");
    expect(fullHexData.length === 380, `Expected 380 hexes, found ${fullHexData.length}`);
    
    // Check ground zero hex (8, 10)
    const townHex = fullHexData.find(h => h.c === 8 && h.r === 10);
    expect(townHex, "Beregost hub (8, 10) must exist");
    expect(townHex.is_difficult === false, "Town hub should be standard terrain");
    expect(townHex.foot_path_minutes === 0, "Beregost hub path cost to itself should be 0");

    // Check difficult terrain classification
    const heavyForest = fullHexData.find(h => h.c === 7 && h.r === 6);
    expect(heavyForest.is_difficult === true, "Heavy forest (7,6) must be classified as difficult terrain");
    expect(heavyForest.foot_hours_per_hex === 2, "Difficult terrain must require 2 hours/hex on foot");
  });

  test("MASTER_NPC_DATA contains 27 canonical NPCs with complete clockwork routines", () => {
    expect(Array.isArray(npcData), "MASTER_NPC_DATA must be an array");
    expect(npcData.length >= 27, `Expected >= 27 NPCs, found ${npcData.length}`);

    npcData.forEach(npc => {
      expect(npc.id && npc.name, `NPC missing id/name: ${JSON.stringify(npc)}`);
      expect(Array.isArray(npc.schedule) && npc.schedule.length > 0, `NPC ${npc.id} must have schedule array`);
      expect(npc.default_fate, `NPC ${npc.id} missing default_fate`);
      expect(npc.intervention, `NPC ${npc.id} missing intervention`);
      expect(npc.persistent_reward, `NPC ${npc.id} missing persistent_reward`);
    });
  });

  test("CAPSTONE_ITEMS_DATA contains all 10 counter-items linked to bosses", () => {
    expect(Array.isArray(capstones), "CAPSTONE_ITEMS_DATA must be an array");
    expect(capstones.length === 10, `Expected 10 capstone items, found ${capstones.length}`);
    capstones.forEach(item => {
      expect(item.id && item.name && item.target_boss && item.hex, `Capstone item ${item.id} invalid`);
    });
  });

  test("DUNGEON_DATA contains all 9 canonical dungeons with room hierarchies", () => {
    expect(Array.isArray(dungeons), "DUNGEON_DATA must be an array");
    expect(dungeons.length === 9, `Expected 9 dungeons, found ${dungeons.length}`);
    dungeons.forEach(d => {
      expect(d.id && d.name && d.boss_name && d.hex, `Dungeon ${d.id} missing core fields`);
      expect(Array.isArray(d.rooms) && d.rooms.length > 0, `Dungeon ${d.id} must have rooms array`);
    });
  });

  test("BEREGOST_BUILDINGS contains all 12 canonical buildings with tactical traits", () => {
    expect(Array.isArray(buildings), "BEREGOST_BUILDINGS must be an array");
    expect(buildings.length === 12, `Expected 12 buildings, found ${buildings.length}`);
    buildings.forEach(b => {
      expect(b.id && b.name && b.tactical && b.secrets && b.keywords, `Building ${b.id} invalid`);
    });
  });

  test("MONSTER_STAT_BLOCKS contains all 26 monsters with complete D&D 2024 / 5.5e schemas & PB", () => {
    expect(typeof monsters === 'object', "MONSTER_STAT_BLOCKS must be an object map");
    expect(Object.keys(monsters).length >= 26, `Expected >= 26 monster stat blocks, found ${Object.keys(monsters).length}`);
    Object.keys(monsters).forEach(mId => {
      const m = monsters[mId];
      expect(m.name && m.cr && m.hp && m.ac && m.pb && m.counter, `Monster ${mId} missing vital 2024 stats`);
      expect(m.edition === "D&D 2024 / 5.5e", `Monster ${mId} must be tagged D&D 2024 / 5.5e`);
    });
  });
});

// ----------------------------------------------------------------------------
// SUITE 3: Timeline Scrubber & Reactive Synchronization
// ----------------------------------------------------------------------------
suite("3. 12-Hour Timeline Scrubber & State Machine", () => {
  const onSliderChange = getGlobal('onSliderChange');
  const formatTime = getGlobal('formatTime');
  const getSectorState = getGlobal('getSectorState');

  test("formatTime() correctly formats minutes into standard 12-hour AM/PM", () => {
    expect(formatTime(360) === "06:00 AM", `360 mins should be 06:00 AM, got ${formatTime(360)}`);
    expect(formatTime(720) === "12:00 PM", `720 mins should be 12:00 PM, got ${formatTime(720)}`);
    expect(formatTime(1080) === "06:00 PM", `1080 mins should be 06:00 PM, got ${formatTime(1080)}`);
  });

  test("06:00 AM Dawn shows crisp & cool morning air with safe normal conditions", () => {
    onSliderChange(360);
    const clockEl = sandbox.document.getElementById('clock-display');
    const heatBadge = sandbox.document.getElementById('heat-badge');
    expect(clockEl.textContent === "06:00 AM", `Clock display expected 06:00 AM, got ${clockEl.textContent}`);
    expect(heatBadge.textContent.includes("Crisp & Cool (Safe)"), `Heat badge expected Crisp & Cool, got ${heatBadge.textContent}`);
    
    const state = getSectorState(360);
    expect(state.beregost.includes("Crisp, cool morning air"), "Beregost morning description should be crisp, cool");
  });

  test("09:00 AM (540 min) triggers Thermal Spike & Divine Static warning", () => {
    onSliderChange(540);
    const heatBadge = sandbox.document.getElementById('heat-badge');
    expect(heatBadge.textContent.includes("Thermal Spike"), `Heat badge expected Thermal Spike, got ${heatBadge.textContent}`);
  });

  test("12:00 PM (720 min) triggers Solar Scorch (2d6 Fire/10m)", () => {
    onSliderChange(720);
    const heatBadge = sandbox.document.getElementById('heat-badge');
    expect(heatBadge.textContent.includes("Solar Scorch"), `Heat badge expected Solar Scorch, got ${heatBadge.textContent}`);
  });

  test("15:00 PM (900 min) triggers Bunker Panic & Conflagration (10d6/rd outdoor)", () => {
    onSliderChange(900);
    const heatBadge = sandbox.document.getElementById('heat-badge');
    expect(heatBadge.textContent.includes("Bunker Panic"), `Heat badge expected Bunker Panic, got ${heatBadge.textContent}`);
  });

  test("18:00 PM (1080 min) triggers Total Detonation", () => {
    onSliderChange(1080);
    const heatBadge = sandbox.document.getElementById('heat-badge');
    expect(heatBadge.textContent.includes("TOTAL SOLAR DETONATION"), `Heat badge expected Detonation, got ${heatBadge.textContent}`);
  });
});

// ----------------------------------------------------------------------------
// SUITE 4: Beregost Town Hub & Live Building Census
// ----------------------------------------------------------------------------
suite("4. Township of Beregost & Live Building Census", () => {
  const getNPCsInTownBuilding = getGlobal('getNPCsInTownBuilding');
  const getTownDepartedNPCs = getGlobal('getTownDepartedNPCs');
  const renderTownSvg = getGlobal('renderTownSvg');
  const inspectHex = getGlobal('inspectHex');

  test("inspectHex(8, 10) renders the Beregost Town Hub Schematic & Directory", () => {
    inspectHex(8, 10);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("Township of Beregost"), "Description must include Township of Beregost");
    expect(descEl.innerHTML.includes("openTownMapModal()"), "Description must have modal CTA button");
    expect(descEl.innerHTML.includes("bldg_clocktower"), "Description must include building directory");
  });

  test("getNPCsInTownBuilding() returns Bram and Corin at Belfry at 06:00 AM", () => {
    const occupants = getNPCsInTownBuilding("bldg_clocktower", 360);
    const ids = occupants.map(o => o.npc.id);
    expect(ids.includes("artificer_bram"), "Artificer Bram should be at Belfry at 06:00 AM");
    expect(ids.includes("corin_urchin"), "Corin should be at Belfry roof at 06:00 AM");
  });

  test("getNPCsInTownBuilding() returns Tobias at Bakery at 06:00 AM", () => {
    const occupants = getNPCsInTownBuilding("bldg_bakery", 360);
    const ids = occupants.map(o => o.npc.id);
    expect(ids.includes("tobias_baker"), "Tobias should be at Bakery at 06:00 AM");
  });

  test("getNPCsInTownBuilding() returns Little Maya at Well Square at 06:00 AM", () => {
    const occupants = getNPCsInTownBuilding("bldg_well", 360);
    const ids = occupants.map(o => o.npc.id);
    expect(ids.includes("little_maya"), "Little Maya should be at Well at 06:00 AM");
  });

  test("getTownDepartedNPCs(720) correctly lists NPCs who departed town by 12:00 PM", () => {
    const departed = getTownDepartedNPCs(720);
    const ids = departed.map(d => d.npc.id);
    expect(ids.includes("artificer_bram"), "Bram departs for East Quarry by noon");
    expect(ids.includes("rakshasa_ravana"), "Aurelius / Ravana departs for northern wilds by noon");
  });

  test("renderTownSvg() generates scalable architectural plan with arterial roads & avatar pins", () => {
    const svg = renderTownSvg(360, "bldg_clocktower", false);
    expect(svg.includes("<svg"), "Must produce valid SVG markup");
    expect(svg.includes("COAST WAY"), "Must render Coast Way highway");
    expect(svg.includes("TEMPLE WALK"), "Must render Temple Walk avenue");
    expect(svg.includes("bldg_clocktower"), "Must render building rect with building ID");
    expect(svg.includes("Artificer"), "Must render avatar chip for Artificer Bram");
    expect(svg.includes("#e3b341"), "Must render golden highlight for selected building");
    expect(!svg.includes('filter="url(#bldg-glow)"'), "Must not use buggy SVG filter that causes buildings to disappear");
  });

  test("Townsfolk congregate in Temple of Lathander crypts during 15:00 PM Conflagration", () => {
    const templeOccupants = getNPCsInTownBuilding("bldg_temple", 900);
    const occupantIds = templeOccupants.map(o => o.npc.id);
    expect(occupantIds.includes("tobias_baker"), "Tobias should be sheltering in Temple Crypts at 15:00 PM");
    expect(occupantIds.includes("little_maya"), "Little Maya should be sheltering in Temple Crypts at 15:00 PM");
    expect(occupantIds.includes("captain_rebecca"), "Captain Rebecca should be guarding Temple Crypt gates at 15:00 PM");
    expect(occupantIds.includes("old_morwen"), "Old Granny Morwen should be in Temple Crypt triage at 15:00 PM");
    expect(occupantIds.includes("sister_althea"), "Sister Althea should be leading prayers in Temple Crypts at 15:00 PM");
    expect(occupantIds.includes("taerom_thunderhammer"), "Taerom should be bracing stone crypt arches at 15:00 PM");
    expect(occupantIds.includes("bartender_feldepost"), "Barnaby Feldepost should be in Temple Crypts at 15:00 PM");
    expect(occupantIds.includes("young_kaelen"), "Young Kaelen should be in Temple Crypts at 15:00 PM");
    expect(occupantIds.includes("corin_urchin"), "Corin should be beside Maya in Temple Crypts at 15:00 PM");
    expect(occupantIds.includes("constable_renwick"), "Constable Renwick should be recovering in Temple Crypts at 15:00 PM");
    expect(templeOccupants.length >= 10, "Expected >= 10 town residents gathered in Temple Crypts at 15:00 PM");
  });

  test("Building click keeps building in town tab list regardless of district filters", () => {
    const selectTownBuilding = getGlobal('selectTownBuilding');
    const renderTownTab = getGlobal('renderTownTab');
    selectTownBuilding('bldg_smithy');
    renderTownTab(360);
    const bldgList = sandbox.document.getElementById('town-tab-bldg-list');
    expect(bldgList.innerHTML.includes('bldg_smithy') || bldgList.innerHTML.includes('Thunderhammer'), "Smithy must remain in list when selected");
    // Restore default clocktower selection
    selectTownBuilding('bldg_clocktower');
  });

  test("renderTownTab() populates Town Map SVG, building details, and occupant census", () => {
    const renderTownTab = getGlobal('renderTownTab');
    expect(typeof renderTownTab === 'function', "renderTownTab must be a global function");
    renderTownTab(360);
    const svgWrap = sandbox.document.getElementById('town-tab-svg-wrap');
    const drawer = sandbox.document.getElementById('town-tab-drawer');
    expect(svgWrap && svgWrap.innerHTML.includes("<svg"), "Town tab SVG wrap must contain rendered SVG");
    expect(drawer && drawer.innerHTML.includes("Grand Clocktower"), "Town tab drawer must render default building");
    expect(drawer && drawer.innerHTML.includes("Artificer Bram"), "Town tab drawer must render Bram inside clocktower at dawn");
  });
});

// ----------------------------------------------------------------------------
// SUITE 5: Difficult Terrain Mechanics & Red Boundaries
// ----------------------------------------------------------------------------
suite("5. Difficult Terrain & Outer Red Boundary Mechanics", () => {
  const inspectHex = getGlobal('inspectHex');

  test("Standard / Highway Hex (9, 9) allows standard 1h foot traversal", () => {
    inspectHex(9, 9);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("1h Foot Cost") || descEl.innerHTML.includes("1 Hour / Hex On Foot"), "Highway hex should have 1h foot cost");
    expect(descEl.innerHTML.includes("Paved Highway") || descEl.innerHTML.includes("Standard Terrain"), "Should identify paved highway or standard terrain");
  });

  test("Difficult Terrain Hex (7, 6) Ash Grove Heavy Forest enforces 2-hour traversal and Red Loop constriction lore", () => {
    inspectHex(7, 6);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("DIFFICULT TERRAIN (2 Hours / Hex On Foot)"), "Must display 2 Hours / Hex On Foot banner");
    expect(descEl.innerHTML.includes("Red Boundary Shape Factor"), "Must explain the mechanical reason for Outer Red Loop constriction");
  });

  test("Difficult Terrain Hex (17, 10) Glacial Peak enforces 2-hour traversal", () => {
    inspectHex(17, 10);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("DIFFICULT TERRAIN (2 Hours / Hex On Foot)"), "Glacial peak must enforce 2h foot cost");
  });
});

// ----------------------------------------------------------------------------
// SUITE 6: Dungeons Tab & Direct Navigation Integration
// ----------------------------------------------------------------------------
suite("6. Dungeons Tab & Tactical Map Interactivity", () => {
  const inspectHex = getGlobal('inspectHex');
  const openDungeon = getGlobal('openDungeon');

  test("Inspecting dungeon hex (12, 16) renders prominent CTA to Sunken Necropolis", () => {
    inspectHex(12, 16);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("openDungeon('dungeon_necropolis')"), "Must have CTA to open Sunken Necropolis");
    expect(descEl.innerHTML.includes("Akh-en-Amon"), "Must list boss Akh-en-Amon");
  });

  test("openDungeon('dungeon_necropolis') renders room hierarchy, Inversion Tablets, and Boss tactics", () => {
    openDungeon('dungeon_necropolis');
    const detailPanel = sandbox.document.getElementById('dungeon-detail-panel');
    expect(detailPanel.innerHTML.includes("Sunken Necropolis"), "Must render dungeon title");
    expect(detailPanel.innerHTML.includes("Inversion Swap Tablets"), "Must render Inversion Swap Tablets relic");
    expect(detailPanel.innerHTML.includes("Akh-en-Amon"), "Must render Boss Akh-en-Amon details");
    expect(detailPanel.innerHTML.includes("Mummy Sentinels"), "Room 2 must render Mummy Sentinels");
    const necropolisData = getGlobal('DUNGEON_DATA').find(d => d.id === 'dungeon_necropolis');
    const room2 = necropolisData.rooms.find(r => r.num === 2);
    const sentinelMonster = room2.monsters.find(m => m.name === 'Mummy Sentinels');
    expect(sentinelMonster && sentinelMonster.id === 'mummy_sentinel', "Room 2 monster must link to 'mummy_sentinel' id");
    expect(sentinelMonster.count === 2, "Room 2 must contain exactly 2 Mummy Sentinels");
  });

  test("openDungeon('dungeon_rimefang') renders Rime-Anchor, Zephyrus, and Dragon tactics", () => {
    openDungeon('dungeon_rimefang');
    const detailPanel = sandbox.document.getElementById('dungeon-detail-panel');
    expect(detailPanel.innerHTML.includes("Rime-Anchor Harpoon"), "Must render Rime-Anchor Harpoon");
    expect(detailPanel.innerHTML.includes("Zephyrus"), "Must render Djinni Zephyrus");
    expect(detailPanel.innerHTML.includes("Rimefang"), "Must render White Dragon Rimefang");
  });

  test("openDungeon('dungeon_mirage') renders Lord Ravana and the Arcanist's Resonance Ledger", () => {
    openDungeon('dungeon_mirage');
    const detailPanel = sandbox.document.getElementById('dungeon-detail-panel');
    expect(detailPanel.innerHTML.includes("The Mirage Pavilion"), "Must render Mirage Pavilion");
    expect(detailPanel.innerHTML.includes("Arcanist's Resonance Ledger"), "Must render Resonance Ledger");
    expect(detailPanel.innerHTML.includes("Lord Ravana"), "Must render Lord Ravana");
  });
});

// ----------------------------------------------------------------------------
// SUITE 7: Monster Statblocks & Tactical Counterplay
// ----------------------------------------------------------------------------
suite("7. Monster Stat Blocks & Tactical Loop Counters", () => {
  const inspectHex = getGlobal('inspectHex');

  test("Inspecting encounter hex (17, 10) renders Adult White Dragon D&D 2024 statblock with PB & actions", () => {
    inspectHex(17, 10);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("Adult White Dragon"), "Must render Adult White Dragon header");
    expect(descEl.innerHTML.includes("CR 13"), "Must display CR 13");
    expect(descEl.innerHTML.includes("PB +5"), "Must display PB +5");
    expect(descEl.innerHTML.includes("D&D 2024 / 5.5e"), "Must display D&D 2024 badge");
    expect(descEl.innerHTML.includes("Tactical Counterplay / Loop Strategy"), "Must render tactical counterplay box");
  });

  test("Inspecting encounter hex (7, 6) renders Horned Fiend (True Angel) D&D 2024 statblock", () => {
    inspectHex(7, 6);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("Horned Fiend (The True Angel)"), "Must render Horned Fiend statblock");
    expect(descEl.innerHTML.includes("PB +4"), "Must display PB +4");
    expect(descEl.innerHTML.includes("Pulls Punches") || descEl.innerHTML.includes("Celestial"), "Must include Pulls Punches or Celestial notes");
  });

  test("Inspecting West Sea Cliffs hex (6, 8) renders Spire of the False Angel & Singing Devil statblock", () => {
    inspectHex(6, 8);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("Spire of the False Angel"), "Must display Spire of the False Angel");
    expect(descEl.innerHTML.includes("Singing Devil"), "Must display Singing Devil in Angel's body");
    expect(descEl.innerHTML.includes("CR 16"), "Must display CR 16");
  });

  test("Inspecting Southeast Dunes hex (11, 12) renders Aerie of the Four Winds & Djinni Zephyrus shrine", () => {
    inspectHex(11, 12);
    const descEl = sandbox.document.getElementById('hex-desc');
    expect(descEl.innerHTML.includes("Aerie of the Four Winds"), "Must display Aerie of the Four Winds");
    expect(descEl.innerHTML.includes("Zephyrus"), "Must display Djinni Zephyrus");
  });

  test("Mummy Sentinel statblock complies with D&D 2024 / 5.5e schema", () => {
    const monsters = getGlobal('MONSTER_STAT_BLOCKS');
    const sentinel = monsters['mummy_sentinel'];
    expect(sentinel, "mummy_sentinel must exist in MONSTER_STAT_BLOCKS");
    expect(sentinel.cr === "3", "Mummy Sentinel must be CR 3");
    expect(sentinel.pb === "+2", "Mummy Sentinel PB must be +2");
    expect(sentinel.hp.includes("58"), "Mummy Sentinel HP must be 58");
    expect(sentinel.vuln === "Fire", "Mummy Sentinel must be vulnerable to Fire");
    expect(sentinel.actions.some(a => a.desc.includes("Mummy Rot")), "Mummy Sentinel must inflict Mummy Rot");
  });
});

// ----------------------------------------------------------------------------
// SUITE 8: Bosses Tab & DAG Pipeline
// ----------------------------------------------------------------------------
suite("8. Bosses Tab & DAG Progression Pipeline", () => {
  test("tab-bosses contains all 6 Boss Dossiers including the True Final Boss", () => {
    const p1 = html.indexOf('id="tab-bosses"');
    const p2 = html.indexOf('id="tab-rakshasa"');
    const bossesSection = html.slice(p1, p2);

    expect(bossesSection.includes('FIRST BOSS (Prelude Capstone): The "Horned Fiend"'), "Missing First Boss Horned Fiend card");
    expect(bossesSection.includes('1. Adult White Dragon — Rimefang'), "Missing Boss 1 White Dragon card");
    expect(bossesSection.includes('2. Mummy Lord — Akh-en-Amon'), "Missing Boss 2 Mummy Lord card");
    expect(bossesSection.includes('3. The Rakshasa — Lord Ravana'), "Missing Boss 3 Rakshasa card");
    expect(bossesSection.includes('4. Storm Giant — Tempest Lord Otheus'), "Missing Boss 4 Storm Giant card");
    expect(bossesSection.includes('5. TRUE FINAL BOSS: The Singing Devil in the Angel\'s Body'), "Missing Boss 5 True Final Boss card");
    expect(bossesSection.includes('Spire of the False Angel (Hex 6, 8)'), "Boss 5 must be situated at Spire of the False Angel (Hex 6, 8)");
    expect(bossesSection.includes('Roadside Interception: Confusing the Party on the West Coast Road'), "Must include Roadside Interception card in Boss 3 Dossier");
  });

  test("DAG button handlers (selectBossDAG 0 through 5) render SVG dependency diagrams", () => {
    const selectBossDAG = getGlobal('selectBossDAG');
    expect(typeof selectBossDAG === 'function', "selectBossDAG must be a global function");

    for (let i = 0; i <= 5; i++) {
      selectBossDAG(i);
      const dagSvg = sandbox.document.getElementById('dag-svg');
      expect(dagSvg.innerHTML.includes('<defs') || dagSvg.innerHTML.includes('<rect'), `DAG stage ${i} must render SVG diagram elements`);
    }
  });
});

// ----------------------------------------------------------------------------
// SUITE 9: Official Dawn Monologue & Reset Flow
// ----------------------------------------------------------------------------
suite("9. Dawn Monologue & Loop Reset Flow", () => {
  const triggerTimeReset = getGlobal('triggerTimeReset');
  const closeResetModal = getGlobal('closeResetModal');

  test("Monologue modal (#monologue-modal) contains verbatim official read-aloud script", () => {
    const pModal = html.indexOf('id="monologue-modal"');
    const modalSection = html.slice(pModal, pModal + 3500);

    expect(modalSection.includes("sharp, heavy <strong>CLACK</strong> as the clock ticks forward to 6:00 AM"), "Must contain CLACK forward to 6:00 AM");
    expect(modalSection.includes("great bronze bell strikes—<strong>GONG</strong>"), "Must contain bell strikes GONG");
    expect(modalSection.includes("pale bone that jammed the mechanism crumbles, dissolving into a fine gray dust"), "Must contain bone crumbling to dust");
    expect(modalSection.includes("The morning air is crisp and cool"), "Must state morning air is crisp and cool");
    expect(modalSection.includes("It is dawn, and the sun sets in 12 hours."), "Must state the sun sets in 12 hours");
    expect(modalSection.includes("Hey! You got the clock working! Thank you! Happy Solstice!"), "Must contain guard's solstice shout");
  });

  test("Solstice Prophecy chant contains Option A 8-line poem and Codex clarifies Aurelius ruse", () => {
    const pChant = html.indexOf('id="solstice-prophecy-poem-text"');
    const chantSection = html.slice(pChant, pChant + 1500);
    const pCodex = html.indexOf('id="solstice-complete-codex-text"');
    const codexSection = html.slice(pCodex, pCodex + 2500);

    expect(chantSection.includes("With six chimes the belfry wakes"), "Chant must start with belfry wakes");
    expect(chantSection.includes("Only one narrow path can provide salvation"), "Chant must contain narrow path line");
    expect(chantSection.includes("First east to the ice, then south to the sand"), "Chant must contain east to ice then south to sand");
    expect(chantSection.includes("Blame not the angel for he is confused"), "Chant must contain blame not angel line");
    expect(chantSection.includes("Led astray by the fiendish ruse"), "Chant must contain fiendish ruse line");
    expect(codexSection.includes("Aurelius"), "Codex must clarify that the devil's ruse is Aurelius");
  });

  test("triggerTimeReset() increments loop, resets time to 360, logs entry, and opens modal", () => {
    const initialLoop = getGlobal('currentLoop');
    triggerTimeReset();
    
    expect(getGlobal('currentLoop') === initialLoop + 1, "currentLoop must increment by 1");
    expect(getGlobal('currentMinutes') === 360, "currentMinutes must reset to 360 (06:00 AM)");
    
    const modal = sandbox.document.getElementById('monologue-modal');
    expect(modal.classList.contains('open'), "monologue-modal should have 'open' class");
    
    closeResetModal();
    expect(!modal.classList.contains('open'), "monologue-modal should close on closeResetModal()");
  });

  test("Day 0 Solstice Street & Tavern Gossip Table (#day0-gossip-card) exists and contains Eastern White Dragon & hoard rumors", () => {
    expect(html.includes('id="day0-gossip-card"'), "Markup missing #day0-gossip-card");
    expect(html.includes('id="day0-gossip-tbody"'), "Markup missing #day0-gossip-tbody");
    expect(html.includes('id="day0-gossip-active-banner"'), "Markup missing #day0-gossip-active-banner");

    const DAY_0_GOSSIP_DATA = getGlobal('DAY_0_GOSSIP_DATA');
    expect(Array.isArray(DAY_0_GOSSIP_DATA), "DAY_0_GOSSIP_DATA must be an array");
    expect(DAY_0_GOSSIP_DATA.length === 12, `Expected 12 rumors in DAY_0_GOSSIP_DATA, got ${DAY_0_GOSSIP_DATA.length}`);

    // Rumor 1: Rimefang & Ice Drafts
    const r1 = DAY_0_GOSSIP_DATA.find(r => r.d12 === 1);
    expect(r1 && r1.topic.includes("Frostpeak Wyrm"), "Rumor 1 must be Frostpeak Wyrm");
    expect(r1.quote.includes("Rimefang") && r1.quote.includes("Cloud Peaks"), "Rumor 1 must mention Rimefang and Cloud Peaks");
    expect(r1.hex[0] === 17 && r1.hex[1] === 10, "Rumor 1 must point to Hex (17, 10)");

    // Rumor 2: Frozen Hoard & Djinn's Brass Urn
    const r2 = DAY_0_GOSSIP_DATA.find(r => r.d12 === 2);
    expect(r2 && r2.topic.includes("Frozen Hoard"), "Rumor 2 must be Frozen Hoard");
    expect(r2.quote.includes("treasure-vault") && r2.quote.includes("Zephyrus") && r2.quote.includes("Wish"), "Rumor 2 must mention frozen treasure vault, Zephyrus, and Wish");
    expect(r2.hex[0] === 17 && r2.hex[1] === 10, "Rumor 2 must point to Hex (17, 10)");

    // Functions
    const rollDay0Gossip = getGlobal('rollDay0Gossip');
    expect(typeof rollDay0Gossip === 'function', "rollDay0Gossip must be a global function");
    const roll = rollDay0Gossip();
    expect(roll >= 1 && roll <= 12, "rollDay0Gossip must return 1-12");

    const selectDay0Gossip = getGlobal('selectDay0Gossip');
    expect(typeof selectDay0Gossip === 'function', "selectDay0Gossip must be a global function");
    selectDay0Gossip(1, false);
    const banner = sandbox.document.getElementById('day0-gossip-active-banner');
    expect(banner && banner.innerHTML.includes("Frostpeak Wyrm"), "Active banner must show selected rumor");

    // False Gossip & Tall Tales (d8)
    const DAY_0_FALSE_GOSSIP_DATA = getGlobal('DAY_0_FALSE_GOSSIP_DATA');
    expect(Array.isArray(DAY_0_FALSE_GOSSIP_DATA), "DAY_0_FALSE_GOSSIP_DATA must be an array");
    expect(DAY_0_FALSE_GOSSIP_DATA.length === 8, `Expected 8 tall tales in DAY_0_FALSE_GOSSIP_DATA, got ${DAY_0_FALSE_GOSSIP_DATA ? DAY_0_FALSE_GOSSIP_DATA.length : 0}`);

    // Tall Tale 1: Dragon-Tamer's Whistle
    const tt1 = DAY_0_FALSE_GOSSIP_DATA.find(t => t.d8 === 1);
    expect(tt1 && tt1.topic.includes("Dragon-Tamer's Silver Whistle"), "Tall Tale 1 must be Dragon-Tamer's Silver Whistle");
    expect(tt1.bogus.includes("Bogus") && tt1.breadcrumb.includes("Dragon-Fire Brandy"), "Tall Tale 1 must have bogus claim and secret breadcrumb");

    const rollDay0FalseGossip = getGlobal('rollDay0FalseGossip');
    expect(typeof rollDay0FalseGossip === 'function', "rollDay0FalseGossip must be a global function");
    const ttRoll = rollDay0FalseGossip();
    expect(ttRoll >= 1 && ttRoll <= 8, "rollDay0FalseGossip must return 1-8");

    const rollAnyDay0Gossip = getGlobal('rollAnyDay0Gossip');
    expect(typeof rollAnyDay0Gossip === 'function', "rollAnyDay0Gossip must be a global function");
    const anyRoll = rollAnyDay0Gossip();
    expect(anyRoll >= 1 && anyRoll <= 20, "rollAnyDay0Gossip must return 1-20");

    selectDay0Gossip(1, true, false);
    expect(banner && banner.innerHTML.includes("Dragon-Tamer's Silver Whistle"), "Active banner must show selected tall tale");
    expect(banner && banner.innerHTML.includes("Bogus Claim"), "Active banner must show bogus claim for tall tale");
  });

  test("Campaign Soundtracks & YouTube Playlists (#soundtrack-modal & CAMPAIGN_SOUNDTRACKS_DATA) contain 5 categories and 30 VGM tracks", () => {
    expect(html.includes('id="soundtrack-modal"'), "Markup missing #soundtrack-modal");
    expect(html.includes('id="quick-soundtrack-strip"'), "Markup missing #quick-soundtrack-strip");
    expect(html.includes('id="campaign-soundtrack-card"'), "Markup missing #campaign-soundtrack-card");

    const CAMPAIGN_SOUNDTRACKS_DATA = getGlobal('CAMPAIGN_SOUNDTRACKS_DATA');
    expect(Array.isArray(CAMPAIGN_SOUNDTRACKS_DATA), "CAMPAIGN_SOUNDTRACKS_DATA must be an array");
    expect(CAMPAIGN_SOUNDTRACKS_DATA.length === 5, `Expected 5 soundtrack categories, got ${CAMPAIGN_SOUNDTRACKS_DATA.length}`);

    const totalTracks = CAMPAIGN_SOUNDTRACKS_DATA.reduce((acc, c) => acc + c.tracks.length, 0);
    expect(totalTracks === 30, `Expected 30 total curated tracks, got ${totalTracks}`);

    // Verify Exploration includes Stone Tower Temple (fNDLoncWz30)
    const expCat = CAMPAIGN_SOUNDTRACKS_DATA.find(c => c.id === 'exploration');
    expect(expCat && expCat.playlistUrl.includes('watch_videos?video_ids='), "Exploration category must have YouTube watch_videos auto-playlist URL");
    const stoneTower = expCat.tracks.find(t => t.videoId === 'fNDLoncWz30');
    expect(stoneTower && stoneTower.title.includes("Stone Tower Temple"), "Exploration must include Stone Tower Temple from Majora's Mask");

    const openSoundtrackModal = getGlobal('openSoundtrackModal');
    const closeSoundtrackModal = getGlobal('closeSoundtrackModal');
    expect(typeof openSoundtrackModal === 'function', "openSoundtrackModal must be a function");
    openSoundtrackModal('exploration');
    const stModal = sandbox.document.getElementById('soundtrack-modal');
    expect(stModal && stModal.classList.contains('open'), "soundtrack-modal must open on openSoundtrackModal()");
    closeSoundtrackModal();
    expect(!stModal.classList.contains('open'), "soundtrack-modal must close on closeSoundtrackModal()");
  });
});

// ----------------------------------------------------------------------------
// SUITE 10: In-App Automated Test Suite & Modal Lifecycle
// ----------------------------------------------------------------------------
suite("10. In-App Automated Test Suite & Modal Lifecycle", () => {
  test("In-App Test Suite Modal (#test-suite-modal) exists in HTML markup", () => {
    expect(html.includes('id="test-suite-modal"'), "Markup missing #test-suite-modal element");
    expect(html.includes('id="inapp-suites-container"'), "Markup missing #inapp-suites-container element");
    expect(html.includes('id="inapp-run-btn"'), "Markup missing #inapp-run-btn element");
  });

  test("openTestSuiteModal() and closeTestSuiteModal() manage modal open class", () => {
    const openTestSuiteModal = getGlobal('openTestSuiteModal');
    const closeTestSuiteModal = getGlobal('closeTestSuiteModal');
    expect(typeof openTestSuiteModal === 'function', "openTestSuiteModal must be global function");
    expect(typeof closeTestSuiteModal === 'function', "closeTestSuiteModal must be global function");

    openTestSuiteModal(false);
    const modalEl = sandbox.document.getElementById('test-suite-modal');
    expect(modalEl.classList.contains('open'), "test-suite-modal must have 'open' class on open");

    closeTestSuiteModal();
    expect(!modalEl.classList.contains('open'), "test-suite-modal must not have 'open' class on close");
  });

  test("IN_APP_TEST_SUITES contains 9 suites and 39 unit tests", () => {
    const inAppSuites = getGlobal('IN_APP_TEST_SUITES');
    expect(Array.isArray(inAppSuites), "IN_APP_TEST_SUITES must be an array");
    expect(inAppSuites.length === 9, `Expected 9 suites, found ${inAppSuites.length}`);
    const totalInAppTests = inAppSuites.reduce((sum, s) => sum + s.tests.length, 0);
    expect(totalInAppTests === 39, `Expected 39 in-app tests, found ${totalInAppTests}`);
  });
});

// ----------------------------------------------------------------------------
// SUITE 11: Hex Map Zoom, Pan & Encounter CR Ratings
// ----------------------------------------------------------------------------
suite("11. Hex Map Zoom, Pan & Encounter CR Badges", () => {
  test("Zoom controls toolbar and CR Badges layer checkbox exist in DOM markup", () => {
    expect(html.includes('id="btn-zoom-in"'), "Markup missing #btn-zoom-in");
    expect(html.includes('id="btn-zoom-out"'), "Markup missing #btn-zoom-out");
    expect(html.includes('id="btn-zoom-reset"'), "Markup missing #btn-zoom-reset");
    expect(html.includes('id="hex-zoom-level-badge"'), "Markup missing #hex-zoom-level-badge");
    expect(html.includes('id="layer-cr-badges"'), "Markup missing #layer-cr-badges checkbox");
  });

  test("zoomHexMap(), resetHexMapZoom(), and zoomToHex() scale and bound viewport correctly", () => {
    const zoomHexMap = getGlobal('zoomHexMap');
    const resetHexMapZoom = getGlobal('resetHexMapZoom');
    const zoomToHex = getGlobal('zoomToHex');
    expect(typeof zoomHexMap === 'function', "zoomHexMap must be global function");
    expect(typeof resetHexMapZoom === 'function', "resetHexMapZoom must be global function");
    expect(typeof zoomToHex === 'function', "zoomToHex must be global function");

    resetHexMapZoom();
    expect(getGlobal('mapZoom') === 1.0, "Reset zoom must set mapZoom to 1.0");

    zoomHexMap(1.5);
    expect(getGlobal('mapZoom') === 1.5, "zoomHexMap(1.5) must set mapZoom to 1.5");

    zoomToHex(17, 10, 2.5);
    expect(getGlobal('mapZoom') === 2.5, "zoomToHex(17, 10, 2.5) must zoom to 2.5x");

    resetHexMapZoom();
    expect(getGlobal('mapZoom') === 1.0, "resetHexMapZoom must restore 1.0x");
  });

  test("getMonsterCRForHex() returns valid CR metadata across bosses and wilderness encounters", () => {
    const getMonsterCRForHex = getGlobal('getMonsterCRForHex');
    expect(typeof getMonsterCRForHex === 'function', "getMonsterCRForHex must be global function");

    // Boss 1: White Dragon (17, 10)
    const boss1 = getMonsterCRForHex(17, 10);
    expect(boss1 && boss1.cr === "13", "Hex (17, 10) must have CR 13");

    // Boss 2: Mummy Lord (12, 16)
    const boss2 = getMonsterCRForHex(12, 16);
    expect(boss2 && boss2.cr === "15", "Hex (12, 16) must have CR 15");

    // True Final Boss: Singing Devil (6, 8)
    const finalBoss = getMonsterCRForHex(6, 8);
    expect(finalBoss && finalBoss.cr === "16", "Hex (6, 8) must have CR 16");

    // Horned Fiend / True Angel (7, 6)
    const angel = getMonsterCRForHex(7, 6);
    expect(angel && angel.cr === "11", "Hex (7, 6) must have CR 11");

    // Wilderness: Owlbear (7, 4)
    const owlbear = getMonsterCRForHex(7, 4);
    expect(owlbear && owlbear.cr === "3", "Hex (7, 4) must have CR 3");

    // Wilderness: Dust Mephit (12, 13)
    const mephit = getMonsterCRForHex(12, 13);
    expect(mephit && mephit.cr === "1/2", "Hex (12, 13) must have CR 1/2");

    // Wilderness Time Loss Obstacle: Quicksand Pit (13, 17)
    const quicksand = getMonsterCRForHex(13, 17);
    expect(quicksand && quicksand.is_time_loss === true, "Hex (13, 17) must be a Time Loss Obstacle");
    expect(quicksand && quicksand.cr === "TL: +2h", "Hex (13, 17) must have TL: +2h time loss");
    expect(quicksand && quicksand.skill_check && quicksand.skill_check.includes("DC"), "Hex (13, 17) must specify skill check DC");
  });

  test("getCRBadgeColors() assigns appropriate color tiers based on encounter threat level", () => {
    const getCRBadgeColors = getGlobal('getCRBadgeColors');
    expect(typeof getCRBadgeColors === 'function', "getCRBadgeColors must be global function");

    const highTier = getCRBadgeColors("13");
    expect(highTier.stroke === "#f85149", "CR 13 must have crimson stroke");

    const midTier = getCRBadgeColors("7");
    expect(midTier.stroke === "#d29922", "CR 7 must have amber stroke");

    const lowTier = getCRBadgeColors("3");
    expect(lowTier.stroke === "#58a6ff", "CR 3 must have cyan stroke");

    const minorTier = getCRBadgeColors("1/2");
    expect(minorTier.stroke === "#3fb950", "CR 1/2 must have emerald stroke");

    // Time Loss Color Tiers
    const tlSevere = getCRBadgeColors("TL: +2h");
    expect(tlSevere.stroke === "#f85149", "TL: +2h must have red stroke");

    const tlStandard = getCRBadgeColors("TL: +1h");
    expect(tlStandard.stroke === "#e3b341", "TL: +1h must have amber stroke");
  });
});

// ----------------------------------------------------------------------------
// SUITE 12: Master Timelines Matrices (Location-Major & Character-Major)
// ----------------------------------------------------------------------------
suite("12. Master Timelines Matrices (Location-Major & Character-Major)", () => {
  test("LOCATION_MAJOR_TABLES contains North, East, and West datasets with full hourly matrices", () => {
    const locTables = getGlobal('LOCATION_MAJOR_TABLES');
    expect(locTables && typeof locTables === 'object', "LOCATION_MAJOR_TABLES must be an object");
    expect(locTables.north && locTables.east && locTables.west, "Must contain north, east, and west tables");

    // North check
    expect(locTables.north.columns.length === 7, "North table must have 7 columns");
    expect(locTables.north.rows.length >= 13, "North table must have >= 13 time rows");
    expect(locTables.north.rows.some(r => r[0] === "11:30" && r[4].includes("DIVINE REJECTION PULSE")), "North table must contain 11:30 AM Divine Rejection Pulse");

    // East check
    expect(locTables.east.columns.length === 7, "East table must have 7 columns");
    expect(locTables.east.rows.length >= 13, "East table must have >= 13 time rows");
    expect(locTables.east.rows.some(r => r[0] === "06:00" && r[2].includes("Snirk")), "East table must contain Snirk the Goblin");

    // West check
    expect(locTables.west.columns.length === 7, "West table must have 7 columns");
    expect(locTables.west.rows.length >= 13, "West table must have >= 13 time rows");
    expect(locTables.west.rows.some(r => r[0] === "06:00" && r[4].includes("Joshua")), "West table must track Prophet Joshua");
  });

  test("CHARACTER_MAJOR_TABLES contains Town, North, East, West, and South Cast datasets", () => {
    const charTables = getGlobal('CHARACTER_MAJOR_TABLES');
    expect(charTables && typeof charTables === 'object', "CHARACTER_MAJOR_TABLES must be an object");
    expect(charTables.town && charTables.north_cast && charTables.east_cast && charTables.west_cast && charTables.south_cast, "Must contain all 5 cast groups");

    // Town Cast check
    expect(charTables.town.columns.length === 6, "Town cast must have 6 columns");
    expect(charTables.town.rows.some(r => r[0] === "07:30" && r[1].includes("Jonas")), "Town cast must track Jonas & Tobias at 07:30");

    // West Cast check
    expect(charTables.west_cast.rows.some(r => r[0] === "05:45" && r[1].includes("Relic Box")), "West cast must track Commodore Vance assault");
  });

  test("switchTimelineMatrixMode() toggles modes and populates subfilters correctly", () => {
    const switchTimelineMatrixMode = getGlobal('switchTimelineMatrixMode');
    expect(typeof switchTimelineMatrixMode === 'function', "switchTimelineMatrixMode must be global function");

    switchTimelineMatrixMode('character');
    expect(getGlobal('currentMatrixMode') === 'character', "currentMatrixMode should be 'character'");

    const subfilterContainer = sandbox.document.getElementById('matrix-subfilters');
    expect(subfilterContainer && subfilterContainer.innerHTML.includes('Town Hub Cast'), "Subfilters should display Character groups");

    switchTimelineMatrixMode('location');
    expect(getGlobal('currentMatrixMode') === 'location', "currentMatrixMode should be 'location'");
    expect(subfilterContainer && subfilterContainer.innerHTML.includes('North Sector'), "Subfilters should display Location sectors");
  });

  test("onMatrixSearch() filters table rows and clearMatrixSearch() resets them", () => {
    const onMatrixSearch = getGlobal('onMatrixSearch');
    const clearMatrixSearch = getGlobal('clearMatrixSearch');
    expect(typeof onMatrixSearch === 'function', "onMatrixSearch must be global function");
    expect(typeof clearMatrixSearch === 'function', "clearMatrixSearch must be global function");

    onMatrixSearch('rejection');
    const tbody = sandbox.document.getElementById('matrix-table-body');
    expect(tbody && tbody.innerHTML.includes('DIVINE REJECTION PULSE'), "Search for 'rejection' should match pulse row");

    clearMatrixSearch();
    expect(getGlobal('currentMatrixSearchQuery') === '', "Search query should be cleared");
  });

  test("openCharacterInMatrix() routes directly to corresponding cast group in tab-timeline", () => {
    const openCharacterInMatrix = getGlobal('openCharacterInMatrix');
    expect(typeof openCharacterInMatrix === 'function', "openCharacterInMatrix must be global function");

    openCharacterInMatrix('vance');
    expect(getGlobal('currentMatrixMode') === 'character', "Should switch matrix mode to character");
    expect(getGlobal('currentMatrixCharacterGroup') === 'west_cast', "Vance should route to west_cast group");

    openCharacterInMatrix('aurelius');
    expect(getGlobal('currentMatrixCharacterGroup') === 'north_cast', "Aurelius should route to north_cast group");
  });
});

// ----------------------------------------------------------------------------
// SUITE 13: Campaign Visual Art Gallery & Offline Assets
// ----------------------------------------------------------------------------
suite("13. Campaign Visual Art Gallery & Offline Assets", () => {
  const getAllCampaignGalleryItems = getGlobal('getAllCampaignGalleryItems');
  const filterGalleryCategory = getGlobal('filterGalleryCategory');
  const toggleGalleryFitMode = getGlobal('toggleGalleryFitMode');
  const onGallerySearchInput = getGlobal('onGallerySearchInput');

  test("getAllCampaignGalleryItems() contains >= 90 artworks with local assets", () => {
    expect(typeof getAllCampaignGalleryItems === 'function', "getAllCampaignGalleryItems must be global function");
    const items = getAllCampaignGalleryItems();
    expect(items.length >= 90, `Expected >= 90 gallery items, got ${items.length}`);

    // Verify all items have local assets and required properties
    items.forEach(it => {
      expect(it.url && it.url.startsWith("assets/images/"), `Item ${it.title} has invalid URL: ${it.url}`);
      expect(it.title && it.title.length > 0, `Item missing title: ${JSON.stringify(it)}`);
      expect(it.catKey, `Item missing catKey: ${it.title}`);
    });
  });

  test("filterGalleryCategory() properly filters by category and renders into tab grid", () => {
    expect(typeof filterGalleryCategory === 'function', "filterGalleryCategory must be global function");

    filterGalleryCategory('bosses');
    const filteredBosses = getGlobal('currentGalleryFilteredItems');
    expect(filteredBosses.length === 6, `Expected 6 boss items, got ${filteredBosses.length}`);

    filterGalleryCategory('buildings');
    const filteredBldgs = getGlobal('currentGalleryFilteredItems');
    expect(filteredBldgs.length === 12, `Expected 12 building items, got ${filteredBldgs.length}`);

    filterGalleryCategory('all');
    const allItems = getGlobal('currentGalleryFilteredItems');
    expect(allItems.length >= 90, "Expected >= 90 items for 'all'");
  });

  test("onGallerySearchInput() filters artworks by title and lore keywords", () => {
    onGallerySearchInput('rimefang');
    const filtered = getGlobal('currentGalleryFilteredItems');
    expect(filtered.some(i => i.title.toLowerCase().includes('rimefang')), "Search should match Rimefang");

    onGallerySearchInput('');
    const resetItems = getGlobal('currentGalleryFilteredItems');
    expect(resetItems.length >= 90, "Clearing search should restore all items");
  });

  test("toggleGalleryFitMode() toggles between contain and cover framing modes", () => {
    const initialMode = getGlobal('galleryFitMode');
    toggleGalleryFitMode();
    const newMode = getGlobal('galleryFitMode');
    expect(newMode !== initialMode, "Framing mode should toggle");
    toggleGalleryFitMode();
    expect(getGlobal('galleryFitMode') === initialMode, "Framing mode should toggle back");
  });

  test("openImagePreviewModal() and closeImagePreviewModal() manage full-page lightbox state", () => {
    const openImagePreviewModal = getGlobal('openImagePreviewModal');
    const closeImagePreviewModal = getGlobal('closeImagePreviewModal');
    expect(typeof openImagePreviewModal === 'function', "openImagePreviewModal must be a function");
    expect(typeof closeImagePreviewModal === 'function', "closeImagePreviewModal must be a function");

    const modal = sandbox.document.getElementById('campaign-image-modal');
    expect(modal, "#campaign-image-modal must exist in DOM");

    openImagePreviewModal('assets/images/boss_rimefang.jpg', 'Rimefang Test View');
    expect(modal.classList.contains('open'), "Modal must have 'open' class when opened");
    const imgEl = sandbox.document.getElementById('campaign-image-modal-img');
    expect(imgEl.src && imgEl.src.includes('boss_rimefang.jpg'), "Image src must be set");

    closeImagePreviewModal();
    expect(!modal.classList.contains('open'), "Modal must not have 'open' class after close");
  });

  test("Majora's Notebook and Dungeons tab markup contain thumbnail interactive expand triggers", () => {
    expect(html.includes('thumbnail-interactive'), "Markup must have thumbnail-interactive CSS class");
    expect(html.includes('image-lightbox-wrapper'), "Markup must have image-lightbox-wrapper");
    expect(html.includes('closeImagePreviewModal'), "Markup must have closeImagePreviewModal trigger");
  });
});

// ----------------------------------------------------------------------------
// SUMMARY REPORT
// ----------------------------------------------------------------------------
console.log(`\n${colors.bold}============================================================================${colors.reset}`);
console.log(`${colors.bold}TEST SUITE EXECUTION SUMMARY${colors.reset}`);
console.log(`============================================================================`);
console.log(`  Total Tests Run:  ${colors.bold}${totalTests}${colors.reset}`);
console.log(`  Passed:           ${colors.bold}${colors.green}${passedTests}${colors.reset}`);
console.log(`  Failed:           ${colors.bold}${failedTests > 0 ? colors.red : colors.gray}${failedTests}${colors.reset}`);
console.log(`  Total Assertions: ${colors.bold}${colors.cyan}${totalAssertions}${colors.reset}`);

if (failedTests > 0) {
  console.log(`\n${colors.bold}${colors.red}❌ SOME TESTS FAILED!${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.bold}${colors.green}✔ ALL 13 TEST SUITES PASSED 100%! ZERO REGRESSIONS DETECTED!${colors.reset}\n`);
  process.exit(0);
}
