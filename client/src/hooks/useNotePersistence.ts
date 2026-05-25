import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/client'
import { fetchRelatedNotes, updateNote, type NoteUpdatePayload } from '../api/notes'
import type { RecentNote } from '../types'

const CONTENT_AUTOSAVE_MS = 800
const METADATA_DEBOUNCE_MS = 400

export type SaveStatus = 'saved' | 'dirty' | 'saving' | 'error'

function getEditableContent(note: RecentNote): string {
  if (note.type === 'checklist') return note.items?.join('\n') ?? ''
  if (note.type === 'code') return note.code ?? ''
  if (note.url) return note.url
  return note.description ?? ''
}

function bodyToPatch(note: RecentNote, body: string): Partial<NoteUpdatePayload> {
  const trimmed = body.trim()
  if (note.type === 'checklist') {
    return {
      items: trimmed
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean),
    }
  }
  if (note.type === 'code') return { code: trimmed || null }
  if (note.url) return { url: trimmed }
  return { description: trimmed || null }
}

function contentPatch(
  note: RecentNote,
  title: string,
  body: string,
): NoteUpdatePayload {
  const patch: NoteUpdatePayload = {}
  const trimmedTitle = title.trim()
  if (trimmedTitle && trimmedTitle !== note.title) {
    patch.title = trimmedTitle
  }
  const currentBody = getEditableContent(note)
  if (body.trim() !== currentBody) {
    Object.assign(patch, bodyToPatch(note, body))
  }
  return patch
}

interface UseNotePersistenceOptions {
  note: RecentNote | null
  title: string
  body: string
  setNote: React.Dispatch<React.SetStateAction<RecentNote | null>>
  onNoteUpdated?: (note: RecentNote) => void
  onLinkedNotesChange?: (linked: Awaited<ReturnType<typeof fetchRelatedNotes>>) => void
  onError?: (message: string) => void
}

export function useNotePersistence({
  note,
  title,
  body,
  setNote,
  onNoteUpdated,
  onLinkedNotesChange,
  onError,
}: UseNotePersistenceOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const pendingRef = useRef<NoteUpdatePayload>({})
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushingRef = useRef(false)
  const noteIdRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const flush = useCallback(async (): Promise<boolean> => {
    if (!note || flushingRef.current) return false

    const patch: NoteUpdatePayload = {
      ...contentPatch(note, title, body),
      ...pendingRef.current,
    }
    pendingRef.current = {}

    if (Object.keys(patch).length === 0) {
      setSaveStatus('saved')
      return true
    }

    flushingRef.current = true
    setSaveStatus('saving')

    try {
      const updated = await updateNote(note.id, patch)
      setNote(updated)
      onNoteUpdated?.(updated)

      if ('tags' in patch) {
        const related = await fetchRelatedNotes(updated.id)
        onLinkedNotesChange?.(related)
      }

      setSaveStatus('saved')
      return true
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save'
      onError?.(message)
      pendingRef.current = { ...patch, ...pendingRef.current }
      setSaveStatus('error')
      return false
    } finally {
      flushingRef.current = false
      const hasPending = Object.keys(pendingRef.current).length > 0
      const stillDirty =
        note !== null && Object.keys(contentPatch(note, title, body)).length > 0
      if (hasPending || stillDirty) {
        setSaveStatus('dirty')
        timerRef.current = setTimeout(() => void flush(), 100)
      }
    }
  }, [note, title, body, setNote, onNoteUpdated, onLinkedNotesChange, onError])

  const scheduleSave = useCallback(
    (delay: number, extra?: NoteUpdatePayload) => {
      if (extra) {
        pendingRef.current = { ...pendingRef.current, ...extra }
      }
      clearTimer()
      setSaveStatus(prev => (prev === 'saving' ? 'saving' : 'dirty'))
      timerRef.current = setTimeout(() => void flush(), delay)
    },
    [flush],
  )

  const applyMetadata = useCallback(
    (patch: NoteUpdatePayload) => {
      if (!note) return
      setNote(prev => {
        if (!prev) return prev
        return {
          ...prev,
          ...(patch.folder !== undefined ? { folder: patch.folder } : {}),
          ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
          ...(patch.isPinned !== undefined ? { isPinned: patch.isPinned } : {}),
          ...(patch.isFavorite !== undefined ? { isFavorite: patch.isFavorite } : {}),
          ...(patch.isArchived !== undefined ? { isArchived: patch.isArchived } : {}),
        }
      })
      scheduleSave(METADATA_DEBOUNCE_MS, patch)
    },
    [note, setNote, scheduleSave],
  )

  const saveNow = useCallback(async (): Promise<boolean> => {
    clearTimer()
    return flush()
  }, [flush])

  useEffect(() => {
    if (note?.id !== noteIdRef.current) {
      noteIdRef.current = note?.id ?? null
      pendingRef.current = {}
      clearTimer()
      setSaveStatus('saved')
    }
  }, [note?.id])

  useEffect(() => {
    if (!note) return
    const patch = contentPatch(note, title, body)
    if (Object.keys(patch).length === 0) return
    scheduleSave(CONTENT_AUTOSAVE_MS)
    return clearTimer
  }, [note, title, body, scheduleSave])

  useEffect(() => () => clearTimer(), [])

  return {
    saveStatus,
    saving: saveStatus === 'saving',
    applyMetadata,
    saveNow,
    preventBlur: (e: React.MouseEvent) => e.preventDefault(),
  }
}
