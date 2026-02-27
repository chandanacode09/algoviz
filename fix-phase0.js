/**
 * Batch-fix phase0 generated files for common LLM schema mistakes.
 */
const fs = require("fs");
const path = require("path");

const dir = "./examples/phase0";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

// Mappings
const categoryMap = {
  "Dynamic Programming": "dynamic-programming",
  "dynamic programming": "dynamic-programming",
  "dp": "dynamic-programming",
  "linked-list": "other",
  "linked list": "other",
  "Tree Traversal": "tree",
  "tree traversal": "tree",
  "Tree Search": "tree",
  "tree search": "tree",
  "Tree Validation": "tree",
  "tree validation": "tree",
  "Graph": "graph",
  "stack": "other",
  "Stack": "other",
  "array": "sorting",
  "Array": "sorting",
};

const difficultyMap = {
  "Beginner": "beginner",
  "Easy": "beginner",
  "easy": "beginner",
  "Medium": "intermediate",
  "medium": "intermediate",
  "Intermediate": "intermediate",
  "Hard": "advanced",
  "hard": "advanced",
  "Advanced": "advanced",
};

const positionMap = {
  "top": "above",
  "bottom": "below",
};

let fixed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
  let changes = [];

  // Fix category
  if (data.metadata.category && categoryMap[data.metadata.category]) {
    changes.push(`category: "${data.metadata.category}" → "${categoryMap[data.metadata.category]}"`);
    data.metadata.category = categoryMap[data.metadata.category];
  }

  // Fix difficulty  
  if (data.metadata.difficulty && difficultyMap[data.metadata.difficulty]) {
    changes.push(`difficulty: "${data.metadata.difficulty}" → "${difficultyMap[data.metadata.difficulty]}"`);
    data.metadata.difficulty = difficultyMap[data.metadata.difficulty];
  }

  // Fix pointer positions
  for (const actor of data.actors) {
    if (actor.type === "pointer" && positionMap[actor.position]) {
      changes.push(`pointer ${actor.id}: position "${actor.position}" → "${positionMap[actor.position]}"`);
      actor.position = positionMap[actor.position];
    }
  }

  // Fix create actions: { type: "create", target: {...} } → { type: "create", actor: {...} }
  for (let si = 0; si < data.steps.length; si++) {
    for (let ai = 0; ai < data.steps[si].actions.length; ai++) {
      const action = data.steps[si].actions[ai];
      if (action.type === "create" && action.target && typeof action.target === "object") {
        changes.push(`step ${si} action ${ai}: create.target → create.actor`);
        action.actor = action.target;
        delete action.target;
      }
    }
  }

  if (changes.length > 0) {
    fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log(`FIXED ${file} (${changes.length} changes):`);
    for (const c of changes) console.log(`  - ${c}`);
    fixed++;
  } else {
    console.log(`OK    ${file} (no changes needed)`);
  }
}

console.log(`\n${fixed} files fixed out of ${files.length}`);
