import { useState } from 'react'
import { useProgress } from '@/contexts/progress-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart,
  Volume2,
  Trash2,
  Search,
  BookOpen,
  AlertCircle,
} from 'lucide-react'

import { speak } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function FavoritesPage() {
  const { progress, removeFavorite, clearMistakes } = useProgress()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFavorites = progress.favoriteWords.filter(
    word =>
      word.chinese.includes(searchQuery) ||
      word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.pinyin?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMistakes = progress.quizMistakes.filter(
    mistake =>
      mistake.word.chinese.includes(searchQuery) ||
      mistake.word.english.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSpeak = (text: string) => {
    speak(text)
  }

  const handleRemoveFavorite = (chinese: string) => {
    removeFavorite(chinese)
    toast.success('Removed from favorites')
  }

  const handleClearMistakes = () => {
    clearMistakes()
    toast.success('Mistakes cleared')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Review</h1>
        <p className="text-muted-foreground mt-1">Review your saved words and mistakes</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search words..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="favorites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            Favorites ({progress.favoriteWords.length})
          </TabsTrigger>
          <TabsTrigger value="mistakes" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Review Mistakes ({progress.quizMistakes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-4">
          {filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavorites.map((word, index) => (
                <Card key={`${word.chinese}-${index}`} className="relative group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{word.level}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFavorite(word.chinese)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl chinese mt-2">{word.chinese}</CardTitle>
                    {word.pinyin && (
                      <p className="text-base md:text-lg pinyin text-primary">{word.pinyin}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{word.english}</p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleSpeak(word.chinese)}
                    >
                      <Volume2 className="h-4 w-4" />
                      Listen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No favorites yet</h3>
              <p className="text-muted-foreground mt-1">
                Start adding words to your favorites while learning
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mistakes" className="space-y-4">
          {progress.quizMistakes.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClearMistakes} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All Mistakes
              </Button>
            </div>
          )}

          {filteredMistakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMistakes.map((mistake, index) => (
                <Card key={`${mistake.word.chinese}-${index}`} className="border-orange-500/20 bg-orange-500/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{mistake.level}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(mistake.date).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl md:text-2xl chinese mt-2">{mistake.word.chinese}</CardTitle>
                    {mistake.word.pinyin && (
                      <p className="text-sm md:text-base pinyin text-primary">{mistake.word.pinyin}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{mistake.word.english}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Your answer:</span>
                      <span className="text-destructive">{mistake.yourAnswer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Correct answer:</span>
                      <span className="text-green-500">{mistake.correctAnswer}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleSpeak(mistake.word.chinese)}
                    >
                      <Volume2 className="h-4 w-4" />
                      Listen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No mistakes to review</h3>
              <p className="text-muted-foreground mt-1">
                Take quizzes to add mistakes to your review list
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}