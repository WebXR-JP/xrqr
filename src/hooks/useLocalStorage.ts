import { useEffect, useState } from 'react'
import type { HistoryItem } from '~/types'

export const useLocalStorage = () => {
  const [history, setHistoryState] = useState<HistoryItem[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('history')
    setHistoryState(savedHistory ? JSON.parse(savedHistory) : [])
  }, [])

  const addHistoryItem = (item: HistoryItem) => {
    const newHistory = [item, ...history]
    localStorage.setItem('history', JSON.stringify(newHistory))
    setHistoryState(newHistory)
  }

  const removeHistoryItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id)
    localStorage.setItem('history', JSON.stringify(newHistory))
    setHistoryState(newHistory)
  }

  const clearHistory = () => {
    localStorage.removeItem('history')
    setHistoryState([])
  }

  return {
    history,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
  }
}
