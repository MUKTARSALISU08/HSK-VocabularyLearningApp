import { useState, useMemo } from 'react'
import { Search, Volume2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { hsk1Lessons } from '@/data/hsk1'
import { hsk2Lessons } from '@/data/hsk2'
import { hsk3Lessons } from '@/data/hsk3'

export interface VocabularyWord {
  chinese: string
  pinyin?: string
  english: string
  sentences: {
    chinese: string
    pinyin?: string
    english: string
  }[]
  level: string
}

// Flatten all vocabulary from all lessons
const getAllVocabulary = (): VocabularyWord[] => {
  const vocabulary: VocabularyWord[] = []
  
  hsk1Lessons.forEach((lesson) => {
    lesson.words.forEach((word) => {
      vocabulary.push({
        ...word,
        level: 'HSK1',
      })
    })
  })
  
  hsk2Lessons.forEach((lesson) => {
    lesson.words.forEach((word) => {
      vocabulary.push({
        ...word,
        level: 'HSK2',
      })
    })
  })
  
  hsk3Lessons.forEach((lesson) => {
    lesson.words.forEach((word) => {
      vocabulary.push({
        ...word,
        level: 'HSK3',
      })
    })
  })
  
  return vocabulary
}

const allVocabulary = getAllVocabulary()

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null)

  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }
    
    const query = searchQuery.toLowerCase().trim()
    
    return allVocabulary.filter((word) => {
      const chineseMatch = word.chinese.toLowerCase().includes(query)
      const pinyinMatch = word.pinyin ? word.pinyin.toLowerCase().includes(query) : false
      const englishMatch = word.english.toLowerCase().includes(query)
      
      return chineseMatch || pinyinMatch || englishMatch
    })
  }, [searchQuery])

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <Input
          type="text"
          placeholder="Search in English, Pinyin, or Chinese..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg"
        />
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWords.map((word, index) => (
                <Card
                  key={`${word.chinese}-${index}`}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                  onClick={() => setSelectedWord(word)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl md:text-3xl chinese">{word.chinese}</span>
                          {word.level === 'HSK1' || word.level === 'HSK2' ? (
                            <span className="text-sm text-muted-foreground pinyin">{word.pinyin}</span>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{word.english}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSpeak(word.chinese)
                        }}
                        className="h-10 w-10"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching in Chinese, Pinyin, or English</p>
            </div>
          )}
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedWord(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Word Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-5xl md:text-6xl chinese">{selectedWord.chinese}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSpeak(selectedWord.chinese)}
                    className="h-12 w-12"
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                </div>
                {selectedWord.level === 'HSK1' || selectedWord.level === 'HSK2' ? (
                  <p className="text-xl pinyin text-primary mb-2">{selectedWord.pinyin}</p>
                ) : null}
                <p className="text-lg">{selectedWord.english}</p>
                <span className="inline-block mt-2 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                  {selectedWord.level}
                </span>
              </div>
              
              {/* Sentence Examples */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Sentence Examples</h3>
                {selectedWord.sentences.map((sentence, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-lg chinese">{sentence.chinese}</p>
                    <p className="text-sm text-muted-foreground pinyin">{sentence.pinyin}</p>
                    <p className="text-sm text-muted-foreground">{sentence.english}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}