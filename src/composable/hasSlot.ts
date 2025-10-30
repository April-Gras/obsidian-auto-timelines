import { Comment, Text, type Slot, type VNode } from "vue";

/**
 * Quick composable to check for a slot when using `defineSlots()`
 *
 * @param slot - A potential Vue slot.
 * @param slotProps - The potencial props associated to that slot.
 * @returns typeguard boolean, `true` if the slot exists.
 */
export function hasSlot(slot: Slot | undefined, slotProps = {}): slot is Slot {
  if (!slot) return false;

  return slot(slotProps).some((vnode: VNode) => {
    if (vnode.type === Comment) return false;

    if (Array.isArray(vnode.children) && !vnode.children.length) return false;

    return (
      vnode.type !== Text ||
      (typeof vnode.children === "string" && vnode.children.trim() !== "")
    );
  });
}
