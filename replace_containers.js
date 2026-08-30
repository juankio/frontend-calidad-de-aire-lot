import fs from 'fs';
import path from 'path';

const componentsDir = '/home/juankio/air-guardian-iot/frontend/components/madlab';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.vue') && f !== 'MadLabContainer.vue' && f !== 'LabScrew.vue');

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has MadLabContainer
  if (content.includes('MadLabContainer')) continue;

  // Add import
  content = content.replace(/<script setup lang="ts">\n(.*?)\n/s, `<script setup lang="ts">\n$1\nimport MadLabContainer from './MadLabContainer.vue'\n`);

  // Replace container start
  content = content.replace(/<template>\n\s*<div class="relative w-full rounded-2xl bg-gradient[^>]*>\n\s*<LabScrew[^>]*\/>\n\s*<LabScrew[^>]*\/>\n\s*<LabScrew[^>]*\/>\n\s*<LabScrew[^>]*\/>/s, '<template>\n  <MadLabContainer>');

  // Some components might just have the `<div class="relative w-full rounded` and not exactly match the screws layout spacing, so let's do a more robust replacement.
  
}
