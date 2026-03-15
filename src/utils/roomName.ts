export function displayRoomName(name?: string, id?: string): string {
  if (!name || name === 'default' || name === id) return '议事厅';
  return name;
}
