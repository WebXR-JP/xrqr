import { useEffect, useState } from 'react'
import type { HistoryItem } from '../types'

interface LocalStorageState {
  encryptionKey: string | null
  history: HistoryItem[]
}

export const useLocalStorage = () => {
  const [state, setState] = useState<LocalStorageState>({
    encryptionKey: null,
    history: [],
  })

  useEffect(() => {
    const savedKey = localStorage.getItem('encryptionKey')
    const savedHistory = localStorage.getItem('history')

    setState({
      encryptionKey: savedKey,
      history: savedHistory ? JSON.parse(savedHistory) : [],
    })
  }, [])

  const setEncryptionKey = (key: string) => {
    localStorage.setItem('encryptionKey', key)
    setState((prev) => ({ ...prev, encryptionKey: key }))
  }

  const addHistoryItem = (item: HistoryItem) => {
    const newHistory = [item, ...state.history]
    localStorage.setItem('history', JSON.stringify(newHistory))
    setState((prev) => ({ ...prev, history: newHistory }))
  }

  const removeHistoryItem = (id: string) => {
    const newHistory = state.history.filter((item) => item.id !== id)
    localStorage.setItem('history', JSON.stringify(newHistory))
    setState((prev) => ({ ...prev, history: newHistory }))
  }

  const clearHistory = () => {
    localStorage.removeItem('history')
    setState((prev) => ({ ...prev, history: [] }))
  }

  return {
    encryptionKey: state.encryptionKey,
    history: state.history,
    setEncryptionKey,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
  }
}
