import fs from 'fs';
import { catalogue } from '../lib/catalogue.mjs';
const medicaments = JSON.parse(fs.readFileSync('./lib/medicaments.json', 'utf8'));

const products = [];

// Add medicaments
for (const med of medicaments) {
  products.push({
    id: med.id,
    name: med.name,
    category: med.category,
    aliases: med.inn ? [med.inn] : [],
    strength: med.strengths || [],
    form: med.forms || [],
    needTags: [],
    isMedication: med.isMedication !== undefined ? med.isMedication : true,
    fictional: false,
    reviewStatus: "Unverified"
  });
}

// Add catalogue items
for (const item of catalogue) {
  products.push({
    id: item.id,
    name: item.name,
    category: item.category,
    aliases: [],
    strength: [],
    form: [],
    needTags: item.indicatedFor || [],
    isMedication: false,
    fictional: true,
    reviewStatus: item.reviewStatus || "DÉMO — Contenu fictif",
    suggestedWording: item.suggestedWording,
    notFor: item.notFor || []
  });
}

// Add explicit test fixtures mentioned by user
products.push(
  { id: "demomed_a", name: "DEMOMED A", category: "Test", aliases: [], strength: ["500 mg"], form: ["Comprimé"], needTags: [], isMedication: true, fictional: true, reviewStatus: "Fixture" },
  { id: "demomed_b", name: "DEMOMED B", category: "Test", aliases: [], strength: ["10 mg"], form: ["Sirop"], needTags: [], isMedication: true, fictional: true, reviewStatus: "Fixture" },
  { id: "testomed_c", name: "TESTOMED C", category: "Test", aliases: [], strength: ["250 mg"], form: ["Gélule"], needTags: [], isMedication: true, fictional: true, reviewStatus: "Fixture" },
  { id: "testomed_d", name: "TESTOMED D", category: "Test", aliases: [], strength: ["20 mg"], form: ["Comprimé"], needTags: [], isMedication: true, fictional: true, reviewStatus: "Fixture" }
);

fs.writeFileSync('./lib/products.json', JSON.stringify(products, null, 2));
console.log('Done writing products.json');
