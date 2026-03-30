ALTER TABLE "gifts" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;

WITH ranked_gifts AS (
  SELECT
    "id",
    row_number() OVER (ORDER BY "created_at" DESC, "id" ASC) AS "next_display_order"
  FROM "gifts"
)
UPDATE "gifts"
SET "display_order" = ranked_gifts."next_display_order"
FROM ranked_gifts
WHERE "gifts"."id" = ranked_gifts."id";
