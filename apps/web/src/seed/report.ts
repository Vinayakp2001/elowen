/**
 * SeedReport accumulates per-collection outcomes (created / reused / failed)
 * across all seeders so the run can print a single tabular summary at the end.
 * See seed-payload-cms design.md → Components (report.ts), Req 9.4.
 */

export type SeedOutcome = "created" | "reused" | "failed"

export interface CollectionReport {
  created: number
  reused: number
  failed: number
}

export class SeedReport {
  /** Keyed by a human label (usually the collection slug). */
  readonly byCollection: Record<string, CollectionReport> = {}

  /**
   * Set to true when a failure occurs that should make the whole run exit
   * non-zero. Individual document failures are recorded via record("...",
   * "failed") and do NOT set this flag (they are isolated per Req 9.3).
   */
  hasFatal = false

  private ensure(label: string): CollectionReport {
    if (!this.byCollection[label]) {
      this.byCollection[label] = { created: 0, reused: 0, failed: 0 }
    }
    return this.byCollection[label]
  }

  /** Record a single document outcome under a collection label. */
  record(label: string, outcome: SeedOutcome): void {
    const entry = this.ensure(label)
    entry[outcome] += 1
  }

  /** Mark the run as having a fatal problem (forces non-zero exit). */
  markFatal(): void {
    this.hasFatal = true
  }

  /** Print a tabular per-collection created / reused / failed summary. */
  print(): void {
    const labels = Object.keys(this.byCollection).sort()

    if (labels.length === 0) {
      console.log("[seed] no operations recorded")
      return
    }

    const header = ["collection", "created", "reused", "failed"]
    const rows = labels.map((label) => {
      const r = this.byCollection[label]
      return [label, String(r.created), String(r.reused), String(r.failed)]
    })

    const widths = header.map((h, i) =>
      Math.max(h.length, ...rows.map((row) => row[i].length)),
    )

    const fmt = (cols: string[]) =>
      cols.map((c, i) => c.padEnd(widths[i])).join("  ")

    console.log("")
    console.log("[seed] summary")
    console.log(fmt(header))
    console.log(widths.map((w) => "-".repeat(w)).join("  "))
    for (const row of rows) {
      console.log(fmt(row))
    }

    const totals = labels.reduce(
      (acc, label) => {
        const r = this.byCollection[label]
        acc.created += r.created
        acc.reused += r.reused
        acc.failed += r.failed
        return acc
      },
      { created: 0, reused: 0, failed: 0 },
    )
    console.log(widths.map((w) => "-".repeat(w)).join("  "))
    console.log(
      fmt(["total", String(totals.created), String(totals.reused), String(totals.failed)]),
    )
    console.log("")

    if (totals.failed > 0 || this.hasFatal) {
      console.log(
        `[seed] completed with issues (failed=${totals.failed}, fatal=${this.hasFatal})`,
      )
    } else {
      console.log("[seed] completed successfully")
    }
  }
}
