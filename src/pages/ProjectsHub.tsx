import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Star,
  GitBranch,
  ArrowLeft,
  AlertCircle,
  Filter,
  Github,
} from "lucide-react";
import {
  projects,
  statusConfig,
  statusOrder,
  languageColors,
  type ProjectStatus,
} from "@/lib/projects";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ALL_FILTER = "all" as const;
type FilterValue = ProjectStatus | typeof ALL_FILTER;

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: ALL_FILTER, label: "All Projects" },
  ...statusOrder.map((s) => ({ value: s, label: statusConfig[s].label })),
];

const assessmentDate = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function ProjectsHub() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL_FILTER);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const updatedAtLabels = useMemo(
    () =>
      Object.fromEntries(
        projects.map((p) => [
          p.name,
          formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true }),
        ])
      ),
    []
  );

  const filtered =
    activeFilter === ALL_FILTER
      ? [...projects].sort(
          (a, b) =>
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        )
      : projects.filter((p) => p.status === activeFilter);

  const counts = statusOrder.reduce<Record<string, number>>((acc, s) => {
    acc[s] = projects.filter((p) => p.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header Bar ── */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Github className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-sm tracking-tight">
                ace4o4 / Projects Hub
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono">
                Full status scan · {projects.length} repos
              </p>
            </div>
          </div>
        </div>
        <a
          href="https://github.com/ace4o4"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground"
        >
          <Github className="w-4 h-4" />
          <span>GitHub Profile</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Summary Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8"
        >
          {statusOrder.map((s) => {
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() =>
                  setActiveFilter(activeFilter === s ? ALL_FILTER : s)
                }
                className={cn(
                  "rounded-xl border p-3 text-left transition-all hover:scale-[1.02]",
                  cfg.bgColor,
                  cfg.borderColor,
                  activeFilter === s && "ring-2 ring-offset-2 ring-offset-background",
                  activeFilter === s && cfg.color.replace("text-", "ring-")
                )}
              >
                <div className={cn("text-xl font-bold font-mono", cfg.color)}>
                  {counts[s]}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* ── Filter Pills ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeFilter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {opt.label}
              {opt.value !== ALL_FILTER && (
                <span className="ml-1.5 opacity-60">{counts[opt.value]}</span>
              )}
              {opt.value === ALL_FILTER && (
                <span className="ml-1.5 opacity-60">{projects.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Project Cards ── */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtered.map((project, i) => {
            const cfg = statusConfig[project.status];
            const isExpanded = expandedCard === project.name;
            const langColor =
              languageColors[project.language ?? ""] ?? "text-muted-foreground";

            return (
              <motion.div
                key={project.name}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "rounded-xl border bg-card/60 backdrop-blur-sm p-5 flex flex-col gap-3",
                  "hover:border-primary/40 transition-colors cursor-pointer",
                  cfg.borderColor
                )}
                onClick={() =>
                  setExpandedCard(isExpanded ? null : project.name)
                }
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm truncate">
                        {project.name}
                      </span>
                      {project.language && (
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted",
                            langColor
                          )}
                        >
                          {project.language}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
                      cfg.bgColor,
                      cfg.borderColor,
                      cfg.color
                    )}
                  >
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", cfg.dotColor)}
                    />
                    {cfg.label}
                  </div>
                </div>

                {/* Meta Row */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {project.stars}
                  </span>
                  {project.openIssues > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      {project.openIssues} open issue
                      {project.openIssues > 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="flex items-center gap-1 ml-auto">
                    <GitBranch className="w-3 h-3" />
                    Updated {updatedAtLabels[project.name]}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border pt-3 flex flex-col gap-3"
                  >
                    <div className={cn("text-xs rounded-lg p-3", cfg.bgColor, cfg.borderColor, "border")}>
                      <span className={cn("font-semibold", cfg.color)}>
                        Status note:{" "}
                      </span>
                      <span className="text-muted-foreground">
                        {project.statusNote}
                      </span>
                    </div>

                    {project.leftoverItems &&
                      project.leftoverItems.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            Leftover / Pending
                          </p>
                          <ul className="space-y-1">
                            {project.leftoverItems.map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-primary hover:underline w-fit"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on GitHub
                    </a>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No projects match this filter.
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-10 font-mono">
          ace4o4 · {projects.length} repositories scanned · Status assessed {assessmentDate}
        </p>
      </main>
    </div>
  );
}
