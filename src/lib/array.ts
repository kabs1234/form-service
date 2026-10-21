export type MoveIndices = {
  readonly from: number;
  readonly to: number;
};

type Replacement<TItem> = {
  readonly index: number;
  readonly item: TItem;
};

function isIndexInRange(items: ReadonlyArray<unknown>, index: number): boolean {
  return index >= 0 && index < items.length;
}

export function replaceItemAt<TItem>(
  items: ReadonlyArray<TItem>,
  { index, item }: Replacement<TItem>,
): TItem[] {
  return items.map((current, currentIndex) => (currentIndex === index ? item : current));
}

export function removeItemAt<TItem>(items: ReadonlyArray<TItem>, index: number): TItem[] {
  return items.filter((_item, currentIndex) => currentIndex !== index);
}

export function moveItem<TItem>(items: ReadonlyArray<TItem>, { from, to }: MoveIndices): TItem[] {
  if (!isIndexInRange(items, from) || !isIndexInRange(items, to)) {
    return [...items];
  }

  const remaining = removeItemAt(items, from);
  return [...remaining.slice(0, to), items[from], ...remaining.slice(to)];
}
