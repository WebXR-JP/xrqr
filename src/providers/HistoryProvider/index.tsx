import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { HistoryItem } from '~/types'

interface HistoryContextType {
  history: HistoryItem[]
  addHistoryItem: (item: HistoryItem) => void
  removeHistoryItem: (id: string) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

const DEFAULT_HISTORY: HistoryItem[] = []

export const HistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<HistoryItem[]>(DEFAULT_HISTORY)

  const addHistoryItem = useCallback((item: HistoryItem) => {
    setHistory((currentHistory) => {
      // 最新と同じ内容の履歴がある場合は追加しない
      if (currentHistory.length > 0 && currentHistory[0].content === item.content) {
        return currentHistory
      }

      const newHistory = [item, ...currentHistory].slice(0, 5) // 最大5件に制限
      localStorage.setItem('history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((currentHistory) => {
      const newHistory = currentHistory.filter((item) => item.id !== id)
      localStorage.setItem('history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem('history')
    setHistory(DEFAULT_HISTORY)
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem('history')
    const loadedHistory = savedHistory ? JSON.parse(savedHistory) : DEFAULT_HISTORY
    setHistory(loadedHistory)
  }, [])

  return (
    <HistoryContext.Provider
      value={{
        history,
        addHistoryItem,
        removeHistoryItem,
        clearHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}

export const useHistory = () => {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
}