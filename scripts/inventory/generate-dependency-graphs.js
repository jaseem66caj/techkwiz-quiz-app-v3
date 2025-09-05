#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the inventory data
const inventoryPath = path.join(__dirname, '../../master_inventory_updated.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

// Function to generate a mermaid graph
function generateMermaidGraph(title, nodes, edges) {
  let graph = `graph TD\n`;
  graph += `    title[${title}]\n`;
  
  // Add nodes
  nodes.forEach(node => {
    graph += `    ${node.id}[${node.label}]\n`;
  });
  
  // Add edges
  edges.forEach(edge => {
    graph += `    ${edge.from} --> ${edge.to}\n`;
  });
  
  return graph;
}

// Generate top-level dependency graph
function generateTopLevelGraph() {
  const nodes = [
    { id: 'nextjs', label: 'Next.js (15.4.4)' },
    { id: 'react', label: 'React (19.1.0)' },
    { id: 'reactdom', label: 'React DOM (19.1.0)' },
    { id: 'framer', label: 'Framer Motion (12.23.9)' },
    { id: 'tailwind', label: 'Tailwind CSS (3.4.0)' },
    { id: 'postcss', label: 'PostCSS (8.4.0)' },
    { id: 'autoprefixer', label: 'Autoprefixer (10.4.0)' },
    { id: 'heroicons', label: 'Heroicons React (2.2.0)' },
    { id: 'recharts', label: 'Recharts (3.1.2)' }
  ];
  
  const edges = [
    { from: 'nextjs', to: 'react' },
    { from: 'nextjs', to: 'reactdom' },
    { from: 'nextjs', to: 'framer' },
    { from: 'nextjs', to: 'tailwind' },
    { from: 'nextjs', to: 'heroicons' },
    { from: 'nextjs', to: 'recharts' },
    { from: 'tailwind', to: 'postcss' },
    { from: 'tailwind', to: 'autoprefixer' }
  ];
  
  return generateMermaidGraph('Top-Level Dependencies', nodes, edges);
}

// Generate feature-specific graph
function generateFeatureGraph() {
  const nodes = [
    { id: 'quizfeature', label: 'Quiz Feature' },
    { id: 'enhancedquiz', label: 'EnhancedQuizInterface' },
    { id: 'quizdb', label: 'Quiz Database' },
    { id: 'quizdata', label: 'Quiz Data Manager' },
    { id: 'react', label: 'React' },
    { id: 'framer', label: 'Framer Motion' },
    { id: 'heroicons', label: 'Heroicons React' }
  ];
  
  const edges = [
    { from: 'quizfeature', to: 'enhancedquiz' },
    { from: 'quizfeature', to: 'quizdb' },
    { from: 'quizfeature', to: 'quizdata' },
    { from: 'enhancedquiz', to: 'react' },
    { from: 'enhancedquiz', to: 'framer' },
    { from: 'enhancedquiz', to: 'heroicons' }
  ];
  
  return generateMermaidGraph('Quiz Feature Dependencies', nodes, edges);
}

// Generate reward system graph
function generateRewardGraph() {
  const nodes = [
    { id: 'rewardsystem', label: 'Reward System' },
    { id: 'newreward', label: 'NewRewardPopup' },
    { id: 'enhancedreward', label: 'EnhancedRewardPopup' },
    { id: 'rewardanimation', label: 'EnhancedRewardAnimation' },
    { id: 'react', label: 'React' },
    { id: 'framer', label: 'Framer Motion' }
  ];
  
  const edges = [
    { from: 'rewardsystem', to: 'newreward' },
    { from: 'rewardsystem', to: 'enhancedreward' },
    { from: 'rewardsystem', to: 'rewardanimation' },
    { from: 'newreward', to: 'react' },
    { from: 'newreward', to: 'framer' },
    { from: 'enhancedreward', to: 'react' },
    { from: 'enhancedreward', to: 'framer' },
    { from: 'rewardanimation', to: 'react' },
    { from: 'rewardanimation', to: 'framer' }
  ];
  
  return generateMermaidGraph('Reward System Dependencies', nodes, edges);
}

// Generate all graphs
const topLevelGraph = generateTopLevelGraph();
const featureGraph = generateFeatureGraph();
const rewardGraph = generateRewardGraph();

// Write graphs to files
const graphsDir = path.join(__dirname, '../../dependency-graphs');
if (!fs.existsSync(graphsDir)) {
  fs.mkdirSync(graphsDir, { recursive: true });
}

fs.writeFileSync(path.join(graphsDir, 'top-level-dependencies.mmd'), topLevelGraph);
fs.writeFileSync(path.join(graphsDir, 'quiz-feature-dependencies.mmd'), featureGraph);
fs.writeFileSync(path.join(graphsDir, 'reward-system-dependencies.mmd'), rewardGraph);

console.log('Dependency graphs generated successfully!');
console.log(`Graphs saved to: ${graphsDir}`);