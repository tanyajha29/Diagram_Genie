export function getDisplayLabel(node: { label: string; type?: string }): string {
  if (!node.label) return '';
  return node.label.replace(/^["'\[]+|["'\]]+$/g, '').trim();
}

export function getDisplaySubtitle(node: { label: string; type?: string }): string {
  return node.type || '';
}
