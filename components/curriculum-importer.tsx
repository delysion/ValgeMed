"use client";

import { useState, useTransition } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "@/components/premium/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { parseCurriculumAction, confirmCurriculumImportAction, type CurriculumImportPreview } from "@/lib/actions/curriculum-import";

interface CurriculumImporterProps {
  className?: string;
}

export function CurriculumImporter({ className }: CurriculumImporterProps) {
  const { locale } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [textInput, setTextInput] = useState("");
  const [preview, setPreview] = useState<CurriculumImportPreview | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());
  const [selectedExams, setSelectedExams] = useState<Set<number>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handlePreview = () => {
    if (!textInput.trim()) return;

    setError(null);
    setSuccessMsg(null);
    setPreview(null);

    startTransition(async () => {
      const inputText = textInput.trim();

      const executeRes = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "curriculum_import", input: inputText, locale }),
      });
      const executeData = await executeRes.json();
      if (!executeData.success) {
        setError(executeData.error || (locale === "et" ? "AI viga" : "AI error"));
        return;
      }

      const result = await parseCurriculumAction(executeData.result, locale);

      if (!result.success || !result.preview) {
        setError(result.error || (locale === "et" ? "Viga" : "Error"));
        return;
      }

      const allSubjects = new Set(result.preview.subjects.map((s) => s.name));
      const allTopics = new Set(result.preview.topics.map((_, i) => i));
      const allExams = new Set(result.preview.exams.map((_, i) => i));
      const allTasks = new Set(result.preview.tasks.map((_, i) => i));

      setSelectedSubjects(allSubjects);
      setSelectedTopics(allTopics);
      setSelectedExams(allExams);
      setSelectedTasks(allTasks);
      setPreview(result.preview);
      setExpandedSection("subjects");
    });
  };

  const toggleSubject = (name: string) => {
    const next = new Set(selectedSubjects);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelectedSubjects(next);
  };

  const toggleAllSubjects = () => {
    if (!preview) return;
    if (selectedSubjects.size === preview.subjects.length) {
      setSelectedSubjects(new Set());
    } else {
      setSelectedSubjects(new Set(preview.subjects.map((s) => s.name)));
    }
  };

  const toggleTopic = (idx: number) => {
    const next = new Set(selectedTopics);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedTopics(next);
  };

  const toggleAllTopics = () => {
    if (!preview) return;
    if (selectedTopics.size === preview.topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(preview.topics.map((_, i) => i)));
    }
  };

  const toggleExam = (idx: number) => {
    const next = new Set(selectedExams);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedExams(next);
  };

  const toggleAllExams = () => {
    if (!preview) return;
    if (selectedExams.size === preview.exams.length) {
      setSelectedExams(new Set());
    } else {
      setSelectedExams(new Set(preview.exams.map((_, i) => i)));
    }
  };

  const toggleTask = (idx: number) => {
    const next = new Set(selectedTasks);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedTasks(next);
  };

  const toggleAllTasks = () => {
    if (!preview) return;
    if (selectedTasks.size === preview.tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(preview.tasks.map((_, i) => i)));
    }
  };

  const handleConfirmImport = () => {
    if (!preview) return;

    const selectedSubjectsList = preview.subjects
      .filter((s) => selectedSubjects.has(s.name))
      .map((s) => ({ name: s.name, notes: s.notes, priority: s.priority, code: s.code, difficulty: s.difficulty, importance: s.importance }));

    const selectedTopicsList = preview.topics
      .filter((_, i) => selectedTopics.has(i))
      .map((t) => ({ name: t.name, subjectName: t.subjectName, priority: t.priority, notes: t.notes, difficulty: t.difficulty, confidence: t.confidence, status: t.status, estimatedMinutes: t.estimatedMinutes, examName: t.examName }));

    const selectedExamsList = preview.exams
      .filter((_, i) => selectedExams.has(i))
      .map((e) => ({ title: e.title, date: e.date, subjectName: e.subjectName, priority: e.priority, notes: e.notes, difficulty: e.difficulty, importance: e.importance, riskLevel: e.riskLevel, readinessScore: e.readinessScore, format: e.format, ects: e.ects }));

    const selectedTasksList = preview.tasks
      .filter((_, i) => selectedTasks.has(i))
      .map((t) => ({ title: t.title, date: t.date, priority: t.priority, notes: t.notes, status: t.status, estimatedMinutes: t.estimatedMinutes, relatedSubjectName: t.relatedSubjectName, relatedTopicName: t.relatedTopicName, relatedExamName: t.relatedExamName }));

    if (selectedSubjectsList.length === 0 && selectedTopicsList.length === 0 &&
        selectedExamsList.length === 0 && selectedTasksList.length === 0) {
      setError(locale === "et" ? "Vali vähemalt üks kirje" : "Select at least one record");
      return;
    }

    startTransition(async () => {
      const result = await confirmCurriculumImportAction(
        {
          subjects: selectedSubjectsList,
          topics: selectedTopicsList,
          exams: selectedExamsList,
          tasks: selectedTasksList,
        },
        locale
      );

      if (result.success) {
        setSuccessMsg(result.message);
        setPreview(null);
        setTextInput("");
        setShowConfirm(false);
      } else {
        setError(result.error || result.message);
      }
    });
  };

  const totalSelected = selectedSubjects.size + selectedTopics.size + selectedExams.size + selectedTasks.size;

  return (
    <>
      <GlassCard tone="cyan" className={cn("relative", className)}>
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-xl border border-cyan/25 bg-cyan/10 p-2.5">
            <Upload className="h-5 w-5 text-cyan" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-text-primary">
              {locale === "et" ? "Kursuse Import" : "Curriculum Import"}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {locale === "et"
                ? "Kopeeri õppekava, ainete nimekiri või eksamite plaan"
                : "Paste syllabus, course list, or exam plan"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={locale === "et"
              ? "Kleebi õppekava tekst siia...\n\nNäide:\nPhysiology: Renal, Cardiac, Respiratory\nBiochemistry: Metabolism, Enzymes\nPhysiology exam: 15 June 2025"
              : "Paste syllabus text here...\n\nExample:\nPhysiology: Renal, Cardiac, Respiratory\nBiochemistry: Metabolism, Enzymes\nPhysiology exam: 15 June 2025"
            }
            rows={5}
            className="resize-none text-sm"
          />

          <Button
            onClick={handlePreview}
            disabled={isPending || !textInput.trim()}
            className="w-full"
            size="sm"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {locale === "et" ? "Analyysin..." : "Analyzing..."}</>
            ) : (
              <>{locale === "et" ? "Eelvaade" : "Preview Import"}</>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose/20 bg-rose/10 p-3 text-sm text-rose">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald/20 bg-emerald/10 p-3 text-sm text-emerald">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </GlassCard>

      {preview && (
        <GlassCard tone="cyan" className="mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">
              {locale === "et" ? "Eelvaade" : "Preview"}
            </h3>
            <span className="text-xs text-text-secondary">
              {totalSelected} {locale === "et" ? "valitud" : "selected"}
            </span>
          </div>

          {preview.subjects.length > 0 && (
            <div className="mb-4 rounded-xl border border-border bg-bg-subtle/30 p-3">
              <button
                onClick={() => setExpandedSection(expandedSection === "subjects" ? null : "subjects")}
                className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
              >
                <span>{locale === "et" ? "Ained" : "Subjects"} ({preview.subjects.length})</span>
                {expandedSection === "subjects" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedSection === "subjects" && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.size === preview.subjects.length}
                      onChange={toggleAllSubjects}
                      className="h-3.5 w-3.5 rounded border-border"
                    />
                    {locale === "et" ? "Vali kõik" : "Select all"}
                  </label>
                  {preview.subjects.map((s) => (
                    <label key={s.name} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.has(s.name)}
                        onChange={() => toggleSubject(s.name)}
                        className="h-3.5 w-3.5 rounded border-border"
                      />
                      <span className="flex-1">{s.name}</span>
                      {s.isNew ? (
                        <span className="text-xs text-cyan">{locale === "et" ? "uus" : "new"}</span>
                      ) : (
                        <span className="text-xs text-text-muted">{locale === "et" ? "eksisteeriv" : "existing"}</span>
                      )}
                      {s.topics.length > 0 && (
                        <span className="text-xs text-text-muted">({s.topics.length} {locale === "et" ? "teemat" : "topics"})</span>
                      )}
                      {s.notes && <span className="text-xs text-cyan max-w-[120px] truncate">{s.notes}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {preview.topics.length > 0 && (
            <div className="mb-4 rounded-xl border border-border bg-bg-subtle/30 p-3">
              <button
                onClick={() => setExpandedSection(expandedSection === "topics" ? null : "topics")}
                className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
              >
                <span>{locale === "et" ? "Teemad" : "Topics"} ({preview.topics.length})</span>
                {expandedSection === "topics" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedSection === "topics" && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTopics.size === preview.topics.length}
                      onChange={toggleAllTopics}
                      className="h-3.5 w-3.5 rounded border-border"
                    />
                    {locale === "et" ? "Vali kõik" : "Select all"}
                  </label>
                  {preview.topics.map((t, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTopics.has(i)}
                        onChange={() => toggleTopic(i)}
                        className="h-3.5 w-3.5 rounded border-border"
                      />
                      <span className="flex-1">{t.name}</span>
                      <span className="text-xs text-text-muted">{t.subjectName}</span>
                      {preview.linkingEnabled && t.examName && (
                        <span className="inline-flex items-center rounded-full border border-border bg-bg-subtle/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                          {t.examName}
                        </span>
                      )}
                      {t.notes && <span className="text-xs text-cyan max-w-[120px] truncate">{t.notes}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {preview.exams.length > 0 && (
            <div className="mb-4 rounded-xl border border-border bg-bg-subtle/30 p-3">
              <button
                onClick={() => setExpandedSection(expandedSection === "exams" ? null : "exams")}
                className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
              >
                <span>{locale === "et" ? "Eksamid" : "Exams"} ({preview.exams.length})</span>
                {expandedSection === "exams" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedSection === "exams" && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExams.size === preview.exams.length}
                      onChange={toggleAllExams}
                      className="h-3.5 w-3.5 rounded border-border"
                    />
                    {locale === "et" ? "Vali kõik" : "Select all"}
                  </label>
                  {preview.exams.map((e, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExams.has(i)}
                        onChange={() => toggleExam(i)}
                        className="h-3.5 w-3.5 rounded border-border"
                      />
                      <span className="flex-1">{e.title}</span>
                      <span className="text-xs text-text-muted">{e.date || "—"}</span>
                      {e.notes && <span className="text-xs text-cyan max-w-[120px] truncate">{e.notes}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {preview.tasks.length > 0 && (
            <div className="mb-4 rounded-xl border border-border bg-bg-subtle/30 p-3">
              <button
                onClick={() => setExpandedSection(expandedSection === "tasks" ? null : "tasks")}
                className="flex w-full items-center justify-between text-sm font-medium text-text-primary"
              >
                <span>{locale === "et" ? "Ülesanded" : "Tasks"} ({preview.tasks.length})</span>
                {expandedSection === "tasks" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expandedSection === "tasks" && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTasks.size === preview.tasks.length}
                      onChange={toggleAllTasks}
                      className="h-3.5 w-3.5 rounded border-border"
                    />
                    {locale === "et" ? "Vali kõik" : "Select all"}
                  </label>
                  {preview.tasks.map((t, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(i)}
                        onChange={() => toggleTask(i)}
                        className="h-3.5 w-3.5 rounded border-border"
                      />
                      <span className="flex-1">{t.title}</span>
                      <span className="text-xs text-text-muted">{t.date || "—"}</span>
                      {preview.linkingEnabled && t.relatedSubjectName && (
                        <span className="inline-flex items-center rounded-full border border-border bg-bg-subtle/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                          {t.relatedSubjectName}
                        </span>
                      )}
                      {preview.linkingEnabled && t.relatedTopicName && (
                        <span className="inline-flex items-center rounded-full border border-border bg-bg-subtle/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                          {t.relatedTopicName}
                        </span>
                      )}
                      {preview.linkingEnabled && t.relatedExamName && (
                        <span className="inline-flex items-center rounded-full border border-border bg-bg-subtle/50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-text-muted">
                          {t.relatedExamName}
                        </span>
                      )}
                      {t.notes && <span className="text-xs text-cyan max-w-[120px] truncate">{t.notes}</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => setShowConfirm(true)}
            disabled={totalSelected === 0}
            className="w-full"
            size="sm"
          >
            {locale === "et" ? "Kinnita Import" : "Confirm Import"} ({totalSelected})
          </Button>
        </GlassCard>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === "et" ? "Kinnita Import" : "Confirm Import"}
            </DialogTitle>
            <DialogDescription>
              {locale === "et"
                ? `Importid ${totalSelected} kirje(id). Kas jätkata?`
                : `Import ${totalSelected} record(s). Continue?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              {locale === "et" ? "Tühista" : "Cancel"}
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {locale === "et" ? "Importin..." : "Importing..."}</>
              ) : (
                locale === "et" ? "Importi" : "Import"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}