export type SmartInputIntent =
  | {
      action: "study_session";
      subject?: string;
      topic?: string;
      durationMinutes?: number;
      notes?: string;
    }
  | {
      action: "review_item";
      subject?: string;
      topic?: string;
      question?: string;
      answer?: string;
    }
  | { action: "subject"; subject?: string }
  | { action: "topic"; subject?: string; topic?: string }
  | {
      action: "exam";
      title: string;
      subject?: string;
      examDate?: string;
      notes?: string;
    }
  | {
      action: "task";
      title: string;
      dueAt?: string;
      priority?: number;
      description?: string;
    }
  | {
      action: "life_admin";
      title: string;
      dueAt?: string;
      category?: "documents" | "housing" | "finance" | "health" | "university" | "travel" | "other";
      priority?: number;
      description?: string;
    }
  | {
      action: "opportunity";
      title: string;
      deadline?: string;
      opportunityType?:
        | "research"
        | "internship"
        | "shadowing"
        | "conference"
        | "scholarship"
        | "volunteering"
        | "student_org"
        | "mentorship"
        | "clinical_exposure"
        | "language_course"
        | "other";
      nextAction?: string;
      description?: string;
    }
  | {
      action: "error_log";
      title: string;
      subject?: string;
      topic?: string;
      description?: string;
      severity?: number;
    }
  | {
      action: "daily_log";
      date?: string;
      energyLevel?: number;
      stressLevel?: number;
      moodLevel?: number;
      studyMinutes?: number;
      activeRecallMinutes?: number;
      passiveStudyMinutes?: number;
      notes?: string;
    }
  | {
      action: "health_log";
      date?: string;
      sleepQuality?: number;
      cognitiveFatigue?: number;
      recoveryQuality?: number;
      foodQuality?: number;
      notes?: string;
    }
  | {
      action: "language_progress";
      title: string;
      language?: "estonian" | "latin" | "english";
      minutes?: number;
      confidence?: number;
      nextPracticeAt?: string;
      notes?: string;
    }
  | {
      action: "contact";
      name: string;
      role?: string;
      institution?: string;
      nextFollowUpAt?: string;
      notes?: string;
    }
  | {
      action: "time_block";
      title: string;
      date?: string;
      blockType?: "study" | "review" | "simulation" | "recovery" | "life_admin" | "language" | "opportunity";
      plannedMinutes?: number;
      notes?: string;
    };

type LifeAdminCategory = Extract<SmartInputIntent, { action: "life_admin" }>["category"];
type OpportunityType = Extract<SmartInputIntent, { action: "opportunity" }>["opportunityType"];

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "UTC",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const scoreLabels = [
  "priority",
  "priorita",
  "prioriteet",
  "confidence",
  "kindlus",
  "severity",
  "raskus",
  "energy",
  "energia",
  "stress",
  "mood",
  "tuju",
  "sleep",
  "uni",
  "fatigue",
  "vasimus",
  "recovery",
  "taastumine",
  "food",
  "toit",
];

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function fold(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function dateKey(date: Date) {
  return dateFormatter.format(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startsWithPrefix(text: string, prefixes: string[]) {
  const folded = fold(text);
  return prefixes.some((prefix) => folded === prefix || folded.startsWith(`${prefix} `));
}

function stripPrefix(text: string, prefixes: string[]) {
  const value = normalize(text);
  const words = value.split(" ");
  const foldedWords = words.map(fold);

  for (const prefix of prefixes) {
    const prefixWords = prefix.split(" ");
    if (prefixWords.every((word, index) => foldedWords[index] === word)) {
      return words.slice(prefixWords.length).join(" ").replace(/^[:,-]\s*/, "").trim();
    }
  }

  return value.replace(/^[:,-]\s*/, "").trim();
}

function extractDate(text: string, now: Date) {
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const european = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (european) {
    const [, day, month, year] = european;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const folded = fold(text);
  if (/\b(?:tomorrow|domani|homme)\b/.test(folded)) return dateKey(addDays(now, 1));
  if (/\b(?:today|oggi|tana)\b/.test(folded)) return dateKey(now);
  if (/\b(?:next week|prossima settimana|settimana prossima|jargmine nadal)\b/.test(folded)) {
    return dateKey(addDays(now, 7));
  }

  return undefined;
}

function removeDateText(text: string) {
  return text
    .replace(/\b(?:due|deadline|by|on|for|follow up|follow-up)\b\s*/gi, " ")
    .replace(/\b(?:entro|scadenza|il|per|follow-up|ricontatta)\b\s*/gi, " ")
    .replace(/\b(?:tahtaeg|tähtaeg|homme|tana|täna|jargmine nadal|järgmine nädal)\b\s*/gi, " ")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ")
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, " ")
    .replace(/\b(?:today|tomorrow|next week|oggi|domani|prossima settimana|settimana prossima)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseLoose(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function extractDuration(text: string) {
  const duration = text.match(
    /\b(\d+(?:[.,]\d+)?)\s*(hours?|hrs?|h|ore?|ora|minuti?|minutes?|mins?|m|tund(?:i)?|t|minut(?:it)?)\b/i,
  );
  if (!duration) return undefined;

  const amount = Number(duration[1].replace(",", "."));
  const unit = fold(duration[2]);
  const isHours = unit.startsWith("h") || unit.startsWith("or") || unit.startsWith("tund") || unit === "t";

  return isHours ? Math.round(amount * 60) : Math.round(amount);
}

function extractScore(text: string, ...labels: string[]) {
  const folded = fold(text);
  const alternatives = labels.map(fold).join("|");
  const match = folded.match(new RegExp(`\\b(?:${alternatives})\\s*(?:level)?\\s*(\\d{1,2})\\b`, "i"));
  if (!match) return undefined;
  return Math.max(0, Math.min(10, Number(match[1])));
}

function removeScores(text: string) {
  return scoreLabels.reduce(
    (value, label) => value.replace(new RegExp(`\\b${label}\\s*(?:level)?\\s*\\d{1,2}\\b`, "gi"), " "),
    text,
  );
}

function extractSubject(text: string) {
  const subjectMatch = text.match(/\b(?:in|for|subject|materia)\s+([\p{L}0-9 _-]{2,80})$/iu);
  return subjectMatch?.[1]?.trim();
}

function removeTrailingSubject(text: string) {
  return text.replace(/\b(?:in|for|subject|materia)\s+[\p{L}0-9 _-]{2,80}$/iu, "").trim();
}

function normalizeEstonianSubject(value: string) {
  const subject = titleCaseLoose(removeScores(removeDateText(value))).replace(/\s+/g, " ").trim();
  if (!subject) return undefined;

  const words = subject.split(" ");
  const last = words[words.length - 1];
  const foldedLast = fold(last);
  if (foldedLast.length > 4 && foldedLast.endsWith("s")) {
    words[words.length - 1] = last.slice(0, -1);
  }

  return words.join(" ");
}

function extractEstonianSubject(text: string) {
  const withoutScores = removeScores(text).trim();
  const aboutMatch = withoutScores.match(/\bkohta\s+([\p{L}0-9 _-]{3,80})$/iu);
  if (aboutMatch) return normalizeEstonianSubject(aboutMatch[1]);

  const trailing = withoutScores.match(/\b([\p{L}][\p{L}0-9_-]{3,80}s)\s*$/iu);
  if (!trailing) return undefined;

  return normalizeEstonianSubject(trailing[1]);
}

function removeEstonianSubject(text: string) {
  const withoutScores = removeScores(text).trim();
  if (/\bkohta\s+[\p{L}0-9 _-]{3,80}$/iu.test(withoutScores)) {
    return withoutScores.replace(/\bkohta\s+[\p{L}0-9 _-]{3,80}$/iu, "").trim();
  }

  return withoutScores.replace(/\s+[\p{L}][\p{L}0-9_-]{3,80}s\s*$/iu, "").trim();
}

function inferLifeAdminCategory(text: string): LifeAdminCategory {
  const lower = fold(text);
  if (/\b(passport|permit|visa|document|id|residence|permesso|soggiorno|documento|carta|identita|pass|viisa|elamisluba|dokument)\b/.test(lower)) {
    return "documents";
  }
  if (/\b(rent|housing|apartment|lease|affitto|casa|uur|korter)\b/.test(lower)) return "housing";
  if (/\b(invoice|bank|tax|tuition|money|finance|fattura|banca|tassa|raha)\b/.test(lower)) return "finance";
  if (/\b(doctor|insurance|health|vaccine|medico|assicurazione|tervis|vaktsiin)\b/.test(lower)) return "health";
  if (/\b(university|faculty|course|registrar|universita|corso|ulikool|kursus)\b/.test(lower)) return "university";
  if (/\b(flight|travel|ticket|trip|viaggio|volo|reis|pilet)\b/.test(lower)) return "travel";
  return "other";
}

function inferOpportunityType(text: string): OpportunityType {
  const lower = fold(text);
  if (lower.includes("scholarship") || lower.includes("borsa") || lower.includes("stipendium") || lower.includes("stipend")) return "scholarship";
  if (/\b(research|ricerca|teadus|uurimis)\b/.test(lower)) return "research";
  if (/\b(internship|tirocinio|praktika)\b/.test(lower)) return "internship";
  if (/\bshadow\b/.test(lower)) return "shadowing";
  if (/\b(conference|conferenza|konverents)\b/.test(lower)) return "conference";
  if (/\b(volunteer|volontariato|vabatahtlik)\b/.test(lower)) return "volunteering";
  if (/\b(mentor|mentorship)\b/.test(lower)) return "mentorship";
  if (/\b(clinical|clinica|kliiniline)\b/.test(lower)) return "clinical_exposure";
  if (/\b(language|lingua|keel)\b/.test(lower)) return "language_course";
  return "other";
}

function inferLanguage(text: string) {
  const lower = fold(text);
  if (/\b(latin|latino|ladina)\b/.test(lower)) return "latin" as const;
  if (/\b(english|inglese|inglise)\b/.test(lower)) return "english" as const;
  return "estonian" as const;
}

function cleanTitle(text: string) {
  return titleCaseLoose(
    removeScores(removeDateText(text))
      .replace(/\b\d+(?:[.,]\d+)?\s*(?:hours?|hrs?|h|ore?|ora|minuti?|minutes?|mins?|m|tund(?:i)?|t|minut(?:it)?)\b/gi, " ")
      .replace(/\b(?:per|for|da)\s*$/gi, " ")
      .replace(/\s+/g, " "),
  );
}

export function parseSmartInputLocally(input: string, now = new Date()): SmartInputIntent | null {
  const text = normalize(input);
  if (!text) return null;

  const lower = fold(text);
  const dueDate = extractDate(text, now);
  const minutes = extractDuration(text);

  if (startsWithPrefix(text, ["life admin", "admin", "document", "documents", "documenti"])) {
    const raw = stripPrefix(text, ["life admin", "admin", "documents", "document", "documenti", "add life admin", "new life admin"]);
    const title = cleanTitle(raw);
    if (!title) return null;
    return {
      action: "life_admin",
      title,
      dueAt: dueDate,
      category: inferLifeAdminCategory(raw),
      priority: extractScore(text, "priority", "priorita", "prioriteet"),
      description: input,
    };
  }

  if (startsWithPrefix(text, ["add task", "new task", "task", "todo", "to do", "lisa ulesanne", "ulesanne"])) {
    const raw = stripPrefix(text, ["add task", "new task", "task", "todo", "to do", "lisa ulesanne", "ulesanne"]);
    const title = cleanTitle(raw);
    if (!title) return null;
    return {
      action: "task",
      title,
      dueAt: dueDate,
      priority: extractScore(text, "priority", "priorita", "prioriteet"),
      description: input,
    };
  }

  if (startsWithPrefix(text, ["aggiungi opportunita", "opportunita", "add opportunity", "opportunity", "deadline", "scadenza", "lisa voimalus", "voimalus"])) {
    const raw = stripPrefix(text, [
      "aggiungi opportunita",
      "opportunita",
      "add opportunity",
      "opportunity",
      "deadline",
      "scadenza",
      "lisa voimalus",
      "voimalus",
    ]);
    const title = cleanTitle(raw);
    if (!title) return null;
    return {
      action: "opportunity",
      title,
      deadline: dueDate,
      opportunityType: inferOpportunityType(raw),
      description: input,
    };
  }

  if (startsWithPrefix(text, ["log error", "add error", "error", "logi viga", "lisa viga", "viga"])) {
    const raw = stripPrefix(text, ["log error", "add error", "error", "logi viga", "lisa viga", "viga"]);
    const subject = extractSubject(raw) ?? extractEstonianSubject(raw);
    const withoutSubject = subject ? removeEstonianSubject(removeTrailingSubject(raw)) : raw;
    const title = cleanTitle(withoutSubject);
    if (!title) return null;
    return {
      action: "error_log",
      title,
      subject,
      description: input,
      severity: extractScore(text, "severity", "raskus", "priority", "priorita", "prioriteet"),
    };
  }

  if (
    startsWithPrefix(text, ["practice", "learn", "language", "harjuta", "opi"]) &&
    /\b(estonian|latin|english|language|eesti|keel|ladina|inglise)\b/i.test(lower)
  ) {
    const raw = stripPrefix(text, ["practice", "learn", "language", "harjuta", "opi"]);
    const language = inferLanguage(raw);
    const title = cleanTitle(raw) || language;
    return {
      action: "language_progress",
      title,
      language,
      minutes,
      confidence: extractScore(text, "confidence", "kindlus"),
      nextPracticeAt: dueDate,
      notes: input,
    };
  }

  if (startsWithPrefix(text, ["health", "log health"])) {
    return {
      action: "health_log",
      date: dueDate,
      sleepQuality: extractScore(text, "sleep", "uni"),
      cognitiveFatigue: extractScore(text, "fatigue", "vasimus"),
      recoveryQuality: extractScore(text, "recovery", "taastumine"),
      foodQuality: extractScore(text, "food", "toit"),
      notes: input,
    };
  }

  if (startsWithPrefix(text, ["daily", "daily log", "log day", "today"])) {
    return {
      action: "daily_log",
      date: dueDate,
      energyLevel: extractScore(text, "energy", "energia"),
      stressLevel: extractScore(text, "stress"),
      moodLevel: extractScore(text, "mood", "tuju"),
      studyMinutes: minutes,
      activeRecallMinutes: /\bactive\b/i.test(text) ? minutes : undefined,
      passiveStudyMinutes: /\bpassive|reading\b/i.test(text) ? minutes : undefined,
      notes: input,
    };
  }

  if (startsWithPrefix(text, ["add contact", "contact", "follow up"])) {
    const raw = stripPrefix(text, ["add contact", "contact", "follow up"]);
    const name = cleanTitle(raw.replace(/\b(?:follow up|follow-up|with)\b/gi, " "));
    if (!name) return null;
    return {
      action: "contact",
      name,
      nextFollowUpAt: dueDate,
      notes: input,
    };
  }

  if (startsWithPrefix(text, ["time block", "block", "schedule"])) {
    const raw = stripPrefix(text, ["time block", "block", "schedule"]);
    const title = cleanTitle(raw);
    if (!title) return null;
    return {
      action: "time_block",
      title,
      date: dueDate,
      blockType: lower.includes("review") ? "review" : lower.includes("language") ? "language" : lower.includes("admin") ? "life_admin" : "study",
      plannedMinutes: minutes,
      notes: input,
    };
  }

  if (startsWithPrefix(text, ["add exam", "exam"])) {
    const raw = stripPrefix(text, ["add exam", "exam"]);
    const subject = extractSubject(raw);
    const title = cleanTitle(removeTrailingSubject(raw));
    if (!title) return null;
    return {
      action: "exam",
      title,
      subject,
      examDate: dueDate,
      notes: input,
    };
  }

  if (startsWithPrefix(text, ["study", "studied", "log study", "studia", "ho studiato", "studio", "opi"])) {
    const raw = stripPrefix(text, ["study", "studied", "log study", "studia", "ho studiato", "studio", "opi"]);
    const cleaned = cleanTitle(raw);
    const subject = cleaned.split(/\bfor\b/i)[0]?.trim();
    if (!subject) return null;
    return {
      action: "study_session",
      subject,
      durationMinutes: minutes,
      notes: input,
    };
  }

  if (
    startsWithPrefix(text, [
      "add question",
      "question",
      "flashcard",
      "add flashcard",
      "aggiungi domanda",
      "domanda",
      "aggiungi flashcard",
      "lisa kusimus",
      "kusimus",
    ])
  ) {
    const raw = stripPrefix(text, [
      "add question",
      "question",
      "flashcard",
      "add flashcard",
      "aggiungi domanda",
      "domanda",
      "aggiungi flashcard",
      "lisa kusimus",
      "kusimus",
    ]);
    const subject = extractSubject(raw) ?? extractEstonianSubject(raw);
    const questionSource = subject ? removeEstonianSubject(removeTrailingSubject(raw)) : raw;
    const question = cleanTitle(questionSource.replace(/^(?:about|su|sui|sulla|sul|riguardo|kohta)\b\s*/i, ""));
    if (!question) return null;
    return {
      action: "review_item",
      subject,
      question,
    };
  }

  if (startsWithPrefix(text, ["add subject", "subject"])) {
    const subject = cleanTitle(stripPrefix(text, ["add subject", "subject"]));
    return subject ? { action: "subject", subject } : null;
  }

  if (startsWithPrefix(text, ["add topic", "topic"])) {
    const raw = stripPrefix(text, ["add topic", "topic"]);
    const subjectMatch = raw.match(/\b(?:to|in|for)\s+(.+?)(?:\s+subject)?$/i);
    const topic = cleanTitle(subjectMatch ? raw.slice(0, subjectMatch.index).trim() : raw);
    const subject = subjectMatch?.[1]?.replace(/\bsubject\b/i, "").trim();
    return topic && subject ? { action: "topic", topic, subject } : null;
  }

  return null;
}
