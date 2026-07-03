export type EventType = 'user' | 'agent' | 'note' | 'decision' | 'task' | 'problem'

export type EventClassification = {
  type: EventType
  confidence: 'explicit' | 'strong' | 'inferred' | 'fallback'
  reason: string
}

const explicitTypeMap: Record<string, EventType> = {
  user: 'user',
  human: 'user',
  prompt: 'user',
  request: 'user',
  agent: 'agent',
  assistant: 'agent',
  ai: 'agent',
  decision: 'decision',
  decided: 'decision',
  task: 'task',
  todo: 'task',
  'action item': 'task',
  problem: 'problem',
  issue: 'problem',
  bug: 'problem',
  error: 'problem',
  blocker: 'problem',
  note: 'note',
}

const explicitPrefix = /^\s*(?:[-*]\s*)?(user|human|prompt|request|agent|assistant|ai|decision|decided|task|todo|action item|problem|issue|bug|error|blocker|note)\s*[:：-]\s+/i

export function classifyDesktopEvent(content: string): EventClassification {
  const text = content.trim()
  const normalized = text.toLowerCase().replace(/\s+/g, ' ')
  const prefix = text.match(explicitPrefix)?.[1]?.toLowerCase()

  if (prefix) {
    return {
      type: explicitTypeMap[prefix] || 'note',
      confidence: 'explicit',
      reason: `Recognized the ${prefix} label`,
    }
  }

  if (!normalized) {
    return { type: 'note', confidence: 'fallback', reason: 'Waiting for context' }
  }

  if (/\b(we decided|decided to|decision|we chose|we selected|we agreed|agreed to|adopted|approved|going with|standardize(?:d)? on)\b/.test(normalized)
    || /(قررنا|قرار|اخترنا|اتفقنا|اعتمدنا)/.test(normalized)) {
    return { type: 'decision', confidence: 'strong', reason: 'Detected a durable choice' }
  }

  if (/^(can|could|would|will) you\b|^(please|i need|i want|i'd like|we need)\b|\?$/.test(normalized)
    || /^(ممكن|بدي|اريد|أريد|لو سمحت|فينا)/.test(normalized)) {
    return { type: 'user', confidence: 'strong', reason: 'Detected a request or prompt' }
  }

  if (/^(added|implemented|fixed|updated|created|removed|verified|built|published|completed|changed|refactored|tested|configured|migrated|shipped)\b/.test(normalized)
    || /^(تم|أضفت|اضفت|نفذت|عدلنا|حدثنا|اصلحت|أصلحت)/.test(normalized)) {
    return { type: 'agent', confidence: 'strong', reason: 'Detected a completed result' }
  }

  if (/^(add|implement|fix|update|create|remove|verify|test|publish|ship|build|configure|migrate|refactor|document|support)\b/.test(normalized)) {
    return { type: 'task', confidence: 'strong', reason: 'Detected an action to complete' }
  }

  if (/\b(error|bug|broken|failed|failure|blocker|blocked|issue|problem|crash|exception|regression|not working|doesn't work|unable to|cannot)\b/.test(normalized)
    || /(خطأ|مشكلة|عطل|لا يعمل|ما بيشتغل|فشل|بلوكَر|بلوكر)/.test(normalized)) {
    return { type: 'problem', confidence: 'strong', reason: 'Detected a failure or blocker' }
  }

  if (/\b(todo|task|next step|action item|follow[- ]?up|need to|needs to|should|must)\b/.test(normalized)
    || /(لازم|مطلوب|مهمة|الخطوة الجاية|يجب)/.test(normalized)) {
    return { type: 'task', confidence: 'inferred', reason: 'Detected follow-up work' }
  }

  return { type: 'note', confidence: 'fallback', reason: 'Saved as general context' }
}
