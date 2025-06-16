import { useCallback, useEffect, useState } from 'react'
import type { HistoryItem } from '~/types'

export const useLocalStorage = () => {
  const [history, setHistoryState] = useState<HistoryItem[]>([])

  const addHistoryItem = useCallback((item: HistoryItem) => {
    const newHistory = [item, ...history]
    localStorage.setItem('history', JSON.stringify(newHistory))
    setHistoryState(newHistory)
  }, [history])

  const removeHistoryItem = useCallback((id: string) => {
    const newHistory = history.filter((item) => item.id !== id)
    localStorage.setItem('history', JSON.stringify(newHistory))
    setHistoryState(newHistory)
  }, [history])

  const clearHistory = useCallback(() => {
    localStorage.removeItem('history')
    setHistoryState([])
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem('history')
    setHistoryState(savedHistory ? JSON.parse(savedHistory) : [])
  }, [])

  return {
    history,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
  }
}
