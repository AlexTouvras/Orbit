import type { Handbook, HandbookPage } from "@/content/handbooks";
import { HandbookBook } from "@/components/handbooks/HandbookBook";
import { VolumeReader } from "@/components/handbooks/volume/VolumeReader";
import type { EssayFeedbackEntry } from "@/lib/essay-feedback-types";
import { pageFeedbackSlug } from "@/lib/handbooks";

export function HandbookPageView({
  handbook,
  page,
  feedbackEntries,
}: {
  handbook: Handbook;
  page: HandbookPage;
  feedbackEntries: EssayFeedbackEntry[];
}) {
  const last = handbook.pages[handbook.pages.length - 1]?.number;
  if (handbook.reader === "volume") {
    return (
      <VolumeReader
        handbook={handbook}
        page={page}
        feedbackEntries={feedbackEntries}
        feedbackSlug={pageFeedbackSlug(handbook.slug, page.number)}
        showFeedback={page.number === last}
      />
    );
  }
  return (
    <HandbookBook
      key={`${handbook.slug}-${page.number}`}
      handbook={handbook}
      page={page}
      feedbackEntries={feedbackEntries}
      feedbackSlug={pageFeedbackSlug(handbook.slug, page.number)}
      showFeedback={page.number === last}
    />
  );
}
