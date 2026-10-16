/**
 * The analytics field card is copied from its source repo on Approve.
 * That HTML does not know this site's handbook. Re-insert each chapter
 * link once unless the sheet already carries it.
 */

const RECONCILE = "/handbooks/data-that-drives-decisions/1";
const DECISION = "/handbooks/data-that-drives-decisions/2";
const ASK_SENTENCE = "Wrong question, wrong audience, or an unclear decision.";
const ASK_GUARD = "data-handbook-ask";

export function ensureAnalyticsHandbookLink(html: string): string {
  let next = html;
  if (!next.includes(RECONCILE)) {
    const pattern = /<p class="kill">([\s\S]*?)<\/p>/;
    const match = pattern.exec(next);
    if (match && !match[1].includes("<a")) {
      next = next.replace(pattern, `<p class="kill"><a href="${RECONCILE}">${match[1]}</a></p>`);
    }
  }
  if (!next.includes(DECISION)) {
    const at = next.indexOf(ASK_SENTENCE);
    if (at >= 0 && !anchorIsOpen(next, at)) {
      next = `${next.slice(0, at)}<a href="${DECISION}">${ASK_SENTENCE}</a>${next.slice(at + ASK_SENTENCE.length)}`;
    }
  }
  if (next.includes(DECISION) && !next.includes(ASK_GUARD) && next.includes("</body>")) {
    const guard = `<script ${ASK_GUARD}>document.querySelectorAll('a[href="${DECISION}"]').forEach(function(a){a.addEventListener("click",function(e){e.stopPropagation();});});</script>`;
    next = next.replace("</body>", `${guard}</body>`);
  }
  return next;
}

function anchorIsOpen(html: string, at: number): boolean {
  const before = html.slice(0, at);
  return before.lastIndexOf("<a") > before.lastIndexOf("</a>");
}
