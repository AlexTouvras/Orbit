/**
 * The analytics field card is copied from its source repo on Approve.
 * That HTML does not know this site's handbook. Re-insert each chapter
 * link once unless the sheet already carries it.
 *
 * The four steps have one name: Ask, Grain, Truth, Use. A copied sheet
 * that still says name → define → consume, or Question and Decision,
 * is rewritten to that set.
 */

const STEP_NAMES: Array<[string, string]> = [
  ["Ask → name → define → consume", "Ask → Grain → Truth → Use"],
  ["<h3>01 Question</h3>", "<h3>01 Ask</h3>"],
  ["<h3>04 Decision</h3>", "<h3>04 Use</h3>"],
];

function useOneStepName(html: string): string {
  let next = html;
  for (const [from, to] of STEP_NAMES) {
    if (next.includes(from)) next = next.replaceAll(from, to);
  }
  return next;
}

const PATH = "/handbooks/data-that-drives-decisions/1";
const DECISION = "/handbooks/data-that-drives-decisions/2";
const GRAIN = "/handbooks/data-that-drives-decisions/3";
const RECONCILE = "/handbooks/data-that-drives-decisions/4";
const KEEP = "/handbooks/data-that-drives-decisions/5";
const PATH_HEADING = "From question to decision";
const ASK_SENTENCE = "Wrong question, wrong audience, or an unclear decision.";
const GRAIN_SENTENCE = "Mismatched grain, inconsistent definitions, incomplete scope.";
const OWNER_SENTENCE = "A named owner approves the definition";
const ASK_MARK = "data-handbook-chapter=\"decision\"";
const GRAIN_MARK = "data-handbook-chapter=\"grain\"";
const ASK_GUARD = "data-handbook-ask-guard";
const GUARD_BODY =
  "document.querySelectorAll('[data-handbook-chapter]').forEach(function(a){a.addEventListener(\"click\",function(e){e.stopPropagation();});});";

export function ensureAnalyticsHandbookLink(html: string): string {
  let next = useOneStepName(html);
  if (!next.includes(PATH)) {
    const at = next.indexOf(PATH_HEADING);
    if (at >= 0 && !anchorIsOpen(next, at)) {
      next = `${next.slice(0, at)}<a href="${PATH}">${PATH_HEADING}</a>${next.slice(at + PATH_HEADING.length)}`;
    }
  }
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
      next = `${next.slice(0, at)}<a href="${DECISION}" ${ASK_MARK}>${ASK_SENTENCE}</a>${next.slice(at + ASK_SENTENCE.length)}`;
    }
  }
  if (!next.includes(GRAIN)) {
    const at = next.indexOf(GRAIN_SENTENCE);
    if (at >= 0 && !anchorIsOpen(next, at)) {
      next = `${next.slice(0, at)}<a href="${GRAIN}" ${GRAIN_MARK}>${GRAIN_SENTENCE}</a>${next.slice(at + GRAIN_SENTENCE.length)}`;
    }
  }
  if (!next.includes(KEEP)) {
    const at = next.indexOf(OWNER_SENTENCE);
    if (at >= 0 && !anchorIsOpen(next, at)) {
      next = `${next.slice(0, at)}<a href="${KEEP}">${OWNER_SENTENCE}</a>${next.slice(at + OWNER_SENTENCE.length)}`;
    }
  }
  if ((next.includes(DECISION) || next.includes(GRAIN)) && next.includes("</body>")) {
    const guard = `<script ${ASK_GUARD}>${GUARD_BODY}</script>`;
    if (!next.includes(ASK_GUARD)) {
      next = next.replace("</body>", `${guard}</body>`);
    } else if (!next.includes("querySelectorAll('[data-handbook-chapter]')")) {
      next = next.replace(/<script data-handbook-ask-guard>[\s\S]*?<\/script>/, guard);
    }
  }
  return next;
}

function anchorIsOpen(html: string, at: number): boolean {
  const before = html.slice(0, at);
  return before.lastIndexOf("<a") > before.lastIndexOf("</a>");
}
