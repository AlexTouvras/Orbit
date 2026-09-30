/**
 * Keep the storytelling robot on Orbit copies of source-owned field cards.
 *
 * Approve copies `index.html` from the source repo. That file does not know
 * about this site's script. Re-insert the tag unless the sheet already
 * mounts a robot (the Agentic AI card's own script does).
 */

const CARD_ID = /^[a-z0-9-]+$/;

export function fieldCardRobotTag(cardId: string): string {
  return `<script type="module" src="/field-card-robot.mjs" data-card="${cardId}"></script>`;
}

export function htmlMountsFieldCardRobot(html: string): boolean {
  return (
    html.includes("field-card-robot.mjs") ||
    html.includes('id = "field-robot"') ||
    html.includes('id="field-robot"')
  );
}

export function ensureFieldCardRobot(html: string, cardId: string): string {
  if (!CARD_ID.test(cardId) || htmlMountsFieldCardRobot(html)) return html;
  const tag = `  ${fieldCardRobotTag(cardId)}\n`;
  const at = html.lastIndexOf("</body>");
  if (at < 0) return `${html}\n${tag}`;
  return `${html.slice(0, at)}${tag}${html.slice(at)}`;
}
