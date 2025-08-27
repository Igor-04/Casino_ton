/**
 * Hook for managing feature cards visibility
 */
import { useState, useEffect } from 'react'

export interface FeatureCardsVisibility {
  protectionCard: boolean
  payoutsCard: boolean
  transparencyCard: boolean
  referralCard: boolean
  networkWarning: boolean
}

const DEFAULT_VISIBILITY: FeatureCardsVisibility = {
  protectionCard: true,
  payoutsCard: true,
  transparencyCard: true,
  referralCard: true,
  networkWarning: true
}

/**
 * Hook for managing feature cards visibility state
 */
export function useFeatureCards() {
  const [featureCardsVisibility, setFeatureCardsVisibility] = useState<FeatureCardsVisibility>(DEFAULT_VISIBILITY)

  // Load saved visibility on mount
  useEffect(() => {
    const savedVisibility = localStorage.getItem('tonGamesFeatureCardsVisibility')
    if (savedVisibility) {
      try {
        const parsedVisibility = JSON.parse(savedVisibility)
        setFeatureCardsVisibility(prev => ({ ...prev, ...parsedVisibility }))
      } catch (error) {
        console.error('Error parsing feature cards visibility:', error)
      }
    }
  }, [])

  // Hide a specific feature card
  const hideFeatureCard = (cardKey: keyof FeatureCardsVisibility) => {
    const newVisibility = {
      ...featureCardsVisibility,
      [cardKey]: false
    }
    setFeatureCardsVisibility(newVisibility)
    localStorage.setItem('tonGamesFeatureCardsVisibility', JSON.stringify(newVisibility))
  }

  // Show a specific feature card
  const showFeatureCard = (cardKey: keyof FeatureCardsVisibility) => {
    const newVisibility = {
      ...featureCardsVisibility,
      [cardKey]: true
    }
    setFeatureCardsVisibility(newVisibility)
    localStorage.setItem('tonGamesFeatureCardsVisibility', JSON.stringify(newVisibility))
  }

  // Reset all cards to visible
  const resetFeatureCards = () => {
    setFeatureCardsVisibility(DEFAULT_VISIBILITY)
    localStorage.setItem('tonGamesFeatureCardsVisibility', JSON.stringify(DEFAULT_VISIBILITY))
  }

  // Check if any cards are visible
  const hasVisibleFeatureCards = Object.values(featureCardsVisibility).some(visible => visible)

  return {
    featureCardsVisibility,
    hideFeatureCard,
    showFeatureCard,
    resetFeatureCards,
    hasVisibleFeatureCards
  }
}