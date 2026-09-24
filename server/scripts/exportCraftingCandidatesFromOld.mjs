import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '../..');

const paths = {
  oldObjs: path.join(rootDir, 'old', 'Nuevo Motor Graf', 'Servidor 7.0', 'Dat', 'OBJ.dat'),
  currentObjs: path.join(rootDir, 'api', 'src', 'jsons', 'objs.json'),
  currentNpcs: path.join(rootDir, 'api', 'src', 'jsons', 'npcs.json'),
  currentRecipes: path.join(rootDir, 'api', 'src', 'jsons', 'craftingRecipes.json'),
};

const materialFields = [
  { key: 'lingh', itemId: 386, label: 'Lingote hierro' },
  { key: 'lingp', itemId: 387, label: 'Lingote plata' },
  { key: 'lingo', itemId: 388, label: 'Lingote oro' },
  { key: 'madera', itemId: 58, label: 'Lena' },
  { key: 'gemas', itemId: 598, label: 'Gema sagrada' },
  { key: 'diamantes', itemId: 695, label: 'Diamante' },
];

const headers = [
  'itemId',
  'name',
  'category',
  'profession',
  'objType',
  'subtype',
  'grhIndex',
  'oldSkillHerreria',
  'oldSkillCarpinteria',
  'suggestedRecipeLevel',
  'materials',
  'goldCost',
  'currentlySold',
  'currentVendors',
  'hasCurrentRecipe',
  'decision',
  'notes',
];

const categorySortOrder = new Map([
  ['Armas', 0],
  ['Escudos', 1],
  ['Cascos', 2],
  ['Armaduras/Tunicas', 3],
  ['Otros', 4],
]);

function parseArgs(argv) {
  const args = { out: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out') {
      args.out = argv[index + 1] ?? null;
      index += 1;
    }
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseOldObjDat(filePath) {
  const text = fs.readFileSync(filePath, 'latin1').replace(/\r\n/g, '\n');
  const objects = new Map();
  let current = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const section = line.match(/^\[OBJ(\d+)\]/i);

    if (section) {
      current = { id: Number(section[1]), values: {} };
      objects.set(current.id, current);
      continue;
    }

    if (!current || !line || line.startsWith("'") || line.startsWith('#')) {
      continue;
    }

    const equalsAt = line.indexOf('=');
    if (equalsAt < 0) {
      continue;
    }

    const key = line.slice(0, equalsAt).trim().toLowerCase();
    let value = line.slice(equalsAt + 1).trim();
    const commentAt = value.indexOf("'");
    if (commentAt >= 0) {
      value = value.slice(0, commentAt).trim();
    }

    current.values[key] = value;
  }

  return objects;
}

function asInt(values, key) {
  const raw = values[key];
  if (raw == null || raw === '') {
    return 0;
  }

  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : 0;
}

function categoryFor(objType, subtype) {
  if (objType === 2 || objType === 26 || objType === 32) {
    return 'Armas';
  }

  if (objType === 3) {
    if (subtype === 1) {
      return 'Cascos';
    }

    if (subtype === 2) {
      return 'Escudos';
    }

    return 'Armaduras/Tunicas';
  }

  if (objType === 16) {
    return 'Escudos';
  }

  if (objType === 17) {
    return 'Cascos';
  }

  return 'Otros';
}

function professionFor(smithSkill, carpentrySkill) {
  if (smithSkill > 0 && carpentrySkill > 0) {
    return 'mixed';
  }

  if (smithSkill > 0) {
    return 'blacksmith';
  }

  if (carpentrySkill > 0) {
    return 'carpentry';
  }

  return 'artisan';
}

function suggestedLevelFor(skills, materials) {
  const skill = Math.max(skills.smith, skills.carpentry);

  if (skill > 0) {
    if (skill <= 40) return 10;
    if (skill <= 80) return 20;
    if (skill <= 120) return 30;
    if (skill <= 160) return 40;
    return 50;
  }

  const materialByKey = new Map(materials.map((material) => [material.key, material.amount]));
  const gems = materialByKey.get('gemas') ?? 0;
  const diamonds = materialByKey.get('diamantes') ?? 0;
  const gold = materialByKey.get('lingo') ?? 0;
  const silver = materialByKey.get('lingp') ?? 0;
  const iron = materialByKey.get('lingh') ?? 0;
  const wood = materialByKey.get('madera') ?? 0;

  if (gems > 0 || diamonds > 0 || gold >= 100 || wood >= 5000) return 50;
  if (gold > 0 || silver >= 100 || iron >= 200 || wood >= 1000) return 40;
  if (silver > 0 || iron >= 75 || wood >= 300) return 30;
  if (iron > 0 || wood > 0) return 20;
  return 10;
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildSoldMap(npcs) {
  const soldMap = new Map();

  for (const [npcId, npc] of Object.entries(npcs)) {
    if (!Array.isArray(npc.objs)) {
      continue;
    }

    for (const stock of npc.objs) {
      const itemId = Number(stock.item);
      if (!Number.isFinite(itemId)) {
        continue;
      }

      const vendors = soldMap.get(itemId) ?? [];
      vendors.push(`${npcId}:${npc.name ?? 'NPC'}`);
      soldMap.set(itemId, vendors);
    }
  }

  return soldMap;
}

function buildCurrentRecipeSet(recipes) {
  return new Set(
    recipes
      .map((recipe) => Number(recipe.itemId))
      .filter((itemId) => Number.isFinite(itemId)),
  );
}

function buildCandidates() {
  const oldObjects = parseOldObjDat(paths.oldObjs);
  const currentObjects = readJson(paths.currentObjs);
  const currentNpcs = readJson(paths.currentNpcs);
  const currentRecipes = readJson(paths.currentRecipes);
  const soldMap = buildSoldMap(currentNpcs);
  const currentRecipeSet = buildCurrentRecipeSet(currentRecipes);

  const rows = [];

  for (const oldObject of oldObjects.values()) {
    const values = oldObject.values;
    const materials = materialFields
      .map((field) => ({
        ...field,
        label: currentObjects[String(field.itemId)]?.name ?? field.label,
        amount: asInt(values, field.key),
      }))
      .filter((material) => material.amount > 0);

    if (materials.length === 0) {
      continue;
    }

    const itemId = oldObject.id;
    const currentObject = currentObjects[String(itemId)] ?? {};
    const name = currentObject.name ?? values.name ?? `OBJ${itemId}`;
    const objType = Number(currentObject.objType ?? asInt(values, 'objtype'));
    const subtype = Number(currentObject.subtipo ?? asInt(values, 'subtipo'));
    const grhIndex = Number(currentObject.grhIndex ?? asInt(values, 'grhindex'));
    const oldSkillHerreria = asInt(values, 'skherreria');
    const oldSkillCarpinteria = asInt(values, 'skcarpinteria');
    const vendors = soldMap.get(itemId) ?? [];
    const hasCurrentRecipe = currentRecipeSet.has(itemId);
    const currentlySold = vendors.length > 0;
    const notes = [
      currentlySold ? 'Revisar si se quita de tienda' : 'Candidato crafting si no se vende',
      hasCurrentRecipe ? 'Ya tiene receta actual' : '',
      currentObjects[String(itemId)] ? '' : 'No existe en api/src/jsons/objs.json',
    ].filter(Boolean);

    rows.push({
      itemId,
      name,
      category: categoryFor(objType, subtype),
      profession: professionFor(oldSkillHerreria, oldSkillCarpinteria),
      objType,
      subtype,
      grhIndex,
      oldSkillHerreria,
      oldSkillCarpinteria,
      suggestedRecipeLevel: suggestedLevelFor(
        { smith: oldSkillHerreria, carpentry: oldSkillCarpinteria },
        materials,
      ),
      materials: materials
        .map((material) => `${material.label}(${material.itemId})x${material.amount}`)
        .join(' + '),
      goldCost: Math.max(1, asInt(values, 'valor')),
      currentlySold: currentlySold ? 'SI' : 'NO',
      currentVendors: vendors.join(' | '),
      hasCurrentRecipe: hasCurrentRecipe ? 'SI' : 'NO',
      decision: currentlySold ? 'REVISAR_TIENDA' : 'REVISAR',
      notes: notes.join(' | '),
    });
  }

  rows.sort((left, right) => {
    const leftCategory = categorySortOrder.get(left.category) ?? 99;
    const rightCategory = categorySortOrder.get(right.category) ?? 99;

    if (leftCategory !== rightCategory) {
      return leftCategory - rightCategory;
    }

    return left.itemId - right.itemId;
  });

  return rows;
}

function rowsToCsv(rows) {
  return [
    headers.join(';'),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(';')),
  ].join('\n');
}

function printSummary(rows) {
  const byCategory = rows.reduce((summary, row) => {
    summary[row.category] = (summary[row.category] ?? 0) + 1;
    return summary;
  }, {});

  const soldCount = rows.filter((row) => row.currentlySold === 'SI').length;
  const recipeCount = rows.filter((row) => row.hasCurrentRecipe === 'SI').length;

  console.log(`Crafting candidates exported: ${rows.length}`);
  console.log(`Currently sold by vendors: ${soldCount}`);
  console.log(`Already in current craftingRecipes.json: ${recipeCount}`);
  console.log(
    `By category: ${Object.entries(byCategory)
      .map(([category, count]) => `${category}=${count}`)
      .join(', ')}`,
  );
}

const args = parseArgs(process.argv.slice(2));
const rows = buildCandidates();
const csv = `${rowsToCsv(rows)}\n`;

if (args.out) {
  const outPath = path.resolve(rootDir, args.out);
  fs.writeFileSync(outPath, csv, 'utf8');
  console.log(`Wrote ${path.relative(rootDir, outPath)}`);
  printSummary(rows);
} else {
  process.stdout.write(csv);
}
