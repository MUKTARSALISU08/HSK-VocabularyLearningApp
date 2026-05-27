import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function speak(text: string, lang: string = 'zh-CN'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser')
    return
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume()
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.8
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onerror = (event) => {
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      console.error('Speech synthesis error:', event.error)
    }
  }

  window.speechSynthesis.speak(utterance)
}