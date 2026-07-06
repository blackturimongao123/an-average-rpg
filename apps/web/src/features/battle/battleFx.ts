export const BATTLE_PACE = {
  turnCharge: 320,
  turnReady: 180,
  hitDelay: 350,
  actionResolve: 900,
  deathDelay: 600,
  attackDuration: 850,
  hitDuration: 800,
  critHitDuration: 950,
  healDuration: 900,
  shakeDuration: 750,
  flashDuration: 400,
} as const;

export function addFxClass(el: HTMLElement | null, className: string, durationMs: number) {
  if (!el) return;
  el.classList.add(className);
  void el.offsetWidth;
  window.setTimeout(() => el.classList.remove(className), durationMs);
}

export function shakeField(fieldEl: HTMLElement | null, intensity = 1) {
  if (!fieldEl) return;
  fieldEl.style.setProperty("--shake-intensity", String(intensity));
  addFxClass(fieldEl, "fx-shake", BATTLE_PACE.shakeDuration);
}

export function flashScreen(flashEl: HTMLElement | null, variant: "enemy" | "death" = "enemy") {
  if (!flashEl) return;
  flashEl.classList.remove("flash-enemy", "flash-death");
  flashEl.classList.add(variant === "death" ? "flash-death" : "flash-enemy", "is-active");
  window.setTimeout(() => flashEl.classList.remove("is-active"), BATTLE_PACE.flashDuration);
}

export function playAttack(unitEl: HTMLElement | null) {
  addFxClass(unitEl, "fx-attack", BATTLE_PACE.attackDuration);
}

export function playHit(unitEl: HTMLElement | null, isCrit: boolean) {
  addFxClass(unitEl, isCrit ? "fx-crit-hit" : "fx-hit", isCrit ? BATTLE_PACE.critHitDuration : BATTLE_PACE.hitDuration);
}

export function playHeal(unitEl: HTMLElement | null) {
  addFxClass(unitEl, "fx-heal", BATTLE_PACE.healDuration);
}

export function playBuff(unitEl: HTMLElement | null) {
  addFxClass(unitEl, "fx-buff", BATTLE_PACE.healDuration);
}

export function playDeath(unitEl: HTMLElement | null) {
  if (!unitEl) return;
  unitEl.classList.add("fx-death");
}

export interface DamagePopupOptions {
  text: string;
  isCrit?: boolean;
  isHeal?: boolean;
  isBuff?: boolean;
  isMiss?: boolean;
  isDodge?: boolean;
}

export function spawnDamagePopup(
  layerEl: HTMLElement | null,
  anchorEl: HTMLElement | null,
  options: DamagePopupOptions
) {
  if (!layerEl || !anchorEl) return;

  const layerRect = layerEl.getBoundingClientRect();
  const anchorRect = anchorEl.getBoundingClientRect();
  const popup = document.createElement("div");
  popup.className = "battle-damage-popup";

  if (options.isHeal) popup.classList.add("heal");
  if (options.isBuff) popup.classList.add("buff");
  if (options.isCrit) popup.classList.add("crit");
  if (options.isMiss) popup.classList.add("miss");
  if (options.isDodge) popup.classList.add("dodge");

  popup.textContent = options.text;
  popup.style.left = `${anchorRect.left + anchorRect.width / 2 - layerRect.left}px`;
  popup.style.top = `${anchorRect.top - layerRect.top}px`;
  layerEl.appendChild(popup);

  requestAnimationFrame(() => popup.classList.add("show"));
  window.setTimeout(() => popup.remove(), 1100);
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
