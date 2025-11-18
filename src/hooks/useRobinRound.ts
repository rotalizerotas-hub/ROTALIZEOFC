'use client'

import { useState, useEffect } from 'react'

interface Driver {
  id: string
  is_online: boolean
}

export function useRobinRound(drivers: Driver[]) {
  const [lastAssignedIndex, setLastAssignedIndex] = useState(0)

  useEffect(() => {
    // Carregar último índice do localStorage
    const stored = localStorage.getItem('lastAssignedDriverIndex')
    if (stored) {
      setLastAssignedIndex(parseInt(stored, 10))
    }
  }, [])

  const getNextDriver = (): Driver | null => {
    if (drivers.length === 0) return null

    // Priorizar entregadores online
    const onlineDrivers = drivers.filter(d => d.is_online)
    const availableDrivers = onlineDrivers.length > 0 ? onlineDrivers : drivers

    if (availableDrivers.length === 0) return null

    // Robin Round
    const nextIndex = (lastAssignedIndex + 1) % availableDrivers.length
    const nextDriver = availableDrivers[nextIndex]

    // Salvar índice
    const fullListIndex = drivers.findIndex(d => d.id === nextDriver.id)
    setLastAssignedIndex(fullListIndex)
    localStorage.setItem('lastAssignedDriverIndex', fullListIndex.toString())

    console.log(`🔄 [ROBIN ROUND] Próximo entregador: ${nextDriver.id} (índice: ${fullListIndex})`)
    
    return nextDriver
  }

  const resetRobinRound = () => {
    setLastAssignedIndex(0)
    localStorage.setItem('lastAssignedDriverIndex', '0')
    console.log('🔄 [ROBIN ROUND] Reset realizado')
  }

  return {
    getNextDriver,
    resetRobinRound,
    lastAssignedIndex
  }
}