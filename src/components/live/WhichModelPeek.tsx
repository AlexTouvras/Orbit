import { FIELD_BOX, fieldScale } from "@/lib/model-choice/field";
import { WHICH_MODEL_PACK } from "@/lib/model-choice/pack";
import { scoreWorkload } from "@/lib/model-choice/score";
import { WORKLOADS } from "@/lib/model-choice/workloads";

/** Opening job on the live reel: cost across, published index up. */
export function WhichModelPeek() {
  const job = WORKLOADS[0];
  const result = scoreWorkload(WHICH_MODEL_PACK.models, job, job.weights);
  const points = result.eligible
    .filter((row) => row.index != null)
    .map((row) => ({
      id: row.model.id,
      cost: row.cost,
      index: row.index as number,
    }));
  const scale = fieldScale(points);
  const { width, height } = FIELD_BOX;
  const winnerId = result.winner?.model.id ?? null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      aria-hidden
      focusable="false"
    >
      <rect width="100%" height="100%" className="fill-void-800" />
      {scale.placed.map((point) => {
        const winner = point.id === winnerId;
        return (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r={winner ? 8 : 4.5}
            className={winner ? "fill-neon-cyan" : "fill-white/75"}
          />
        );
      })}
    </svg>
  );
}
