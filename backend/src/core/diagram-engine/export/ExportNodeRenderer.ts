import type { ExportNode, ExportColorTheme } from './types';

import { getAbsolutePosition, getNodeWidth, getNodeHeight } from './ExportBoundsCalculator';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getDisplayLabelLocal(node: { label: string; type?: string }): string {
  const label = node.label.trim();
  
  // Clean double bracket syntax like "[Client] [Client]" or "[Client]"
  let cleanLabel = label.replace(/[\[\]]/g, '').trim();
  
  // Deduplicate consecutive identical words (e.g. "Client Client" -> "Client")
  const tokens = cleanLabel.split(/\s+/);
  if (tokens.length === 2 && tokens[0].toLowerCase() === tokens[1].toLowerCase()) {
    cleanLabel = tokens[0];
  }
  
  // Fix double repeats in parsed names (like "API Gateway API Gateway")
  if (cleanLabel.toLowerCase().includes('gateway') && cleanLabel.toLowerCase().match(/gateway/g)?.length === 2) {
    cleanLabel = 'API Gateway';
  }
  if (cleanLabel.toLowerCase().includes('balancer') && cleanLabel.toLowerCase().match(/balancer/g)?.length === 2) {
    cleanLabel = 'Load Balancer';
  }

  return cleanLabel;
}

function getDisplaySubtitleLocal(node: { label: string; type?: string }): string {
  const type = (node.type || '').trim().toLowerCase();
  const label = node.label.trim().toLowerCase();

  // Omit subtitle redundant labels
  if (
    type === 'default' || 
    type === 'service' || 
    type === 'table' || 
    type === 'class' || 
    type === 'group' || 
    type === 'container' ||
    label.includes(type)
  ) {
    return '';
  }
  return type.toUpperCase();
}

// Inline path constants for visual card icons
const ICONS = {
  monitor: `<rect x="2" y="3" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M8 21h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />`,
  cpu: `<rect x="4" y="4" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M9 1v3M15 1v3M9 18v3M15 18v3M20 9h-3M20 15h-3M4 9H1M4 15H1" stroke="currentColor" stroke-width="2" stroke-linecap="round" />`,
  database: `<ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" stroke-width="2" />
             <path d="M3 5v6c0 1.66 4 3 9 3s9-1.34 9-3V5M3 11v6c0 1.66 4 3 9 3s9-1.34 9-3v-6" fill="none" stroke="currentColor" stroke-width="2" />`,
  external: `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
  help: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
         <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />`,
  default: `<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" fill="none" stroke="currentColor" stroke-width="2" />`
};

export class ExportNodeRenderer {
  static render(
    node: ExportNode,
    allNodes: ExportNode[],
    theme: ExportColorTheme,
    diagramType: string
  ): string {
    const absPos = getAbsolutePosition(node, allNodes);
    const w = getNodeWidth(node);
    const h = getNodeHeight(node);
    const label = getDisplayLabelLocal({ label: node.label, type: node.type });

    // Handle group container cards (Task 4 & 9)
    if (node.type === 'group' || node.type === 'container') {
      const isExternal = node.id === 'group_external';
      const borderStroke = isExternal ? '#A855F7' : theme.containerBorder;
      const borderStyle = isExternal ? 'stroke-dasharray="6,4"' : '';
      
      let fillBg = theme.containerBackground;
      let headerTextColor = theme.text;
      
      // Categorized group container background fills (Task 9)
      if (theme.background !== '#FFFFFF') { // Only shade backgrounds in non-neutral themes
        if (node.id === 'group_presentation') fillBg = 'rgba(59, 130, 246, 0.05)';
        if (node.id === 'group_application') fillBg = 'rgba(34, 197, 94, 0.05)';
        if (node.id === 'group_business') fillBg = 'rgba(249, 115, 22, 0.05)';
        if (node.id === 'group_data') fillBg = 'rgba(100, 116, 139, 0.05)';
        if (node.id === 'group_external') fillBg = 'rgba(168, 85, 247, 0.05)';
      }

      return `
        <!-- Container Group: ${escapeXml(label)} -->
        <g id="${node.id}">
          <rect x="${absPos.x}" y="${absPos.y}" width="${w}" height="${h}" rx="16" ry="16" 
                fill="${fillBg}" stroke="${borderStroke}" stroke-width="2" ${borderStyle} />
          <!-- Header block text -->
          <rect x="${absPos.x}" y="${absPos.y}" width="${w}" height="32" rx="16" ry="0" fill="none" />
          <text x="${absPos.x + 16}" y="${absPos.y + 20}" font-family="system-ui, -apple-system, sans-serif" 
                font-size="10" font-weight="bold" fill="${escapeXml(headerTextColor)}" letter-spacing="1" opacity="0.8">
            ${escapeXml(label.toUpperCase())}
          </text>
        </g>
      `;
    }

    // Resolve node styling configuration based on node type role (Task 5)
    const rawType = (node.type || 'default').toLowerCase();
    const style = theme.nodeThemes[rawType] || theme.nodeThemes.default;

    // 1. ER Node / Database Table Representation
    if (diagramType.includes('db') || diagramType.includes('er') || rawType === 'table') {
      const properties = node.properties || {};
      const fields = Object.entries(properties);

      let fieldsSvg = '';
      let currentY = absPos.y + 46;

      fields.forEach(([name, type]) => {
        fieldsSvg += `
          <text x="${absPos.x + 16}" y="${currentY}" font-family="monospace, sans-serif" font-size="10" font-weight="bold" fill="${theme.text}">${escapeXml(name)}</text>
          <text x="${absPos.x + w - 16}" y="${currentY}" font-family="monospace, sans-serif" font-size="10" fill="${theme.mutedText}" text-anchor="end">${escapeXml(type)}</text>
        `;
        currentY += 18;
      });

      if (fields.length === 0) {
        fieldsSvg = `<text x="${absPos.x + w/2}" y="${absPos.y + 70}" font-family="system-ui, sans-serif" font-size="10" fill="${theme.mutedText}" text-anchor="middle" font-style="italic">No columns defined</text>`;
      }

      return `
        <!-- ER Table: ${escapeXml(label)} -->
        <g id="${node.id}">
          <rect x="${absPos.x}" y="${absPos.y}" width="${w}" height="${h}" rx="12" ry="12" 
                fill="${theme.cardBackground}" stroke="${style.border}" stroke-width="2" />
          <!-- Header row -->
          <path d="M ${absPos.x} ${absPos.y + 32} L ${absPos.x + w} ${absPos.y + 32}" stroke="${style.border}" stroke-width="1.5" />
          <text x="${absPos.x + 16}" y="${absPos.y + 20}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold" fill="${style.border}">${escapeXml(label)}</text>
          <!-- Table fields list -->
          ${fieldsSvg}
        </g>
      `;
    }

    // 2. Flowchart Decision Node (Diamond shape)
    if (rawType === 'decision') {
      const halfW = w / 2;
      const halfH = h / 2;
      const points = `${absPos.x + halfW},${absPos.y} ${absPos.x + w},${absPos.y + halfH} ${absPos.x + halfW},${absPos.y + h} ${absPos.x},${absPos.y + halfH}`;

      return `
        <!-- Decision Diamond: ${escapeXml(label)} -->
        <g id="${node.id}">
          <polygon points="${points}" fill="${style.bg}" stroke="${style.border}" stroke-width="2" />
          <text x="${absPos.x + halfW}" y="${absPos.y + halfH + 4}" font-family="system-ui, sans-serif" 
                font-size="11" font-weight="bold" fill="${theme.text}" text-anchor="middle">
            ${escapeXml(label)}
          </text>
        </g>
      `;
    }

    // 3. Flowchart Terminal Node (Capsule shape)
    if (rawType === 'terminal') {
      return `
        <!-- Terminal: ${escapeXml(label)} -->
        <g id="${node.id}">
          <rect x="${absPos.x}" y="${absPos.y}" width="${w}" height="${h}" rx="${h / 2}" ry="${h / 2}" 
                fill="${style.bg}" stroke="${style.border}" stroke-width="2" />
          <text x="${absPos.x + w/2}" y="${absPos.y + h/2 + 4}" font-family="system-ui, sans-serif" 
                font-size="11" font-weight="bold" fill="${theme.text}" text-anchor="middle">
            ${escapeXml(label)}
          </text>
        </g>
      `;
    }

    // 4. UML Class Compartment Box
    if (rawType === 'class' || rawType === 'interface') {
      const properties = node.properties || {};
      const fields = Object.entries(properties);

      let fieldsSvg = '';
      let currentY = absPos.y + 44;

      fields.forEach(([name, type]) => {
        fieldsSvg += `
          <text x="${absPos.x + 12}" y="${currentY}" font-family="monospace" font-size="10" fill="${theme.text}">+ ${escapeXml(name)}: ${escapeXml(type)}</text>
        `;
        currentY += 16;
      });

      return `
        <!-- UML Class: ${escapeXml(label)} -->
        <g id="${node.id}">
          <rect x="${absPos.x}" y="${absPos.y}" width="${w}" height="${h}" rx="0" ry="0" 
                fill="${theme.cardBackground}" stroke="${style.border}" stroke-width="2" />
          <!-- Class name compartment -->
          <text x="${absPos.x + w/2}" y="${absPos.y + 20}" font-family="monospace" font-size="11" font-weight="bold" fill="${theme.text}" text-anchor="middle">${escapeXml(label)}</text>
          <path d="M ${absPos.x} ${absPos.y + 30} L ${absPos.x + w} ${absPos.y + 30}" stroke="${style.border}" stroke-width="1.5" />
          <!-- Class properties compartment -->
          ${fieldsSvg}
        </g>
      `;
    }

    // 5. Default / Architecture Node Card (Task 4)
    let iconKey: keyof typeof ICONS = 'default';
    if (rawType === 'frontend') iconKey = 'monitor';
    else if (rawType === 'backend' || rawType === 'service') iconKey = 'cpu';
    else if (rawType === 'database') iconKey = 'database';
    else if (rawType === 'external') iconKey = 'external';

    const iconMarkup = ICONS[iconKey] || ICONS.default;
    const subtitle = getDisplaySubtitleLocal({ label: node.label, type: rawType });

    return `
      <!-- Architecture Node: ${escapeXml(label)} -->
      <g id="${node.id}">
        <!-- Border Card -->
        <rect x="${absPos.x}" y="${absPos.y}" width="${w}" height="${h}" rx="12" ry="12" 
              fill="${style.bg}" stroke="${style.border}" stroke-width="2" />
        
        <!-- Left Side Icon Backdrop Block -->
        <g transform="translate(${absPos.x + 12}, ${absPos.y + (h - 32) / 2})">
          <rect x="0" y="0" width="32" height="32" rx="8" ry="8" fill="${style.bg}" opacity="0.1" />
          <!-- Vector Icon Path -->
          <g transform="translate(4, 4)" color="${style.accent}">
            ${iconMarkup}
          </g>
        </g>

        <!-- Node Titles -->
        <text x="${absPos.x + 56}" y="${absPos.y + (subtitle ? 34 : 42)}" font-family="system-ui, -apple-system, sans-serif" 
              font-size="12" font-weight="bold" fill="${theme.text}">
          ${escapeXml(label)}
        </text>
        ${subtitle ? `
        <text x="${absPos.x + 56}" y="${absPos.y + 48}" font-family="system-ui, -apple-system, sans-serif" 
              font-size="9" fill="${theme.mutedText}" opacity="0.8">
          ${escapeXml(subtitle)}
        </text>` : ''}
      </g>
    `;
  }
}
