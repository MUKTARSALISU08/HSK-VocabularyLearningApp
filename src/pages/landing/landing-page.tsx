import { useState, useEffect, useRef } from 'react'
import { Link } from 'wouter'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown, Book, Brain, Flame, BarChart3 } from 'lucide-react'

const HSK_CHARACTERS = [
  '你', '我', '他', '她', '学', '习', '中', '国', '人', '朋',
  '友', '谢', '欢', '迎', '好', '家', '爱', '看', '说', '听',
  '读', '写', '字', '词', '句', '文', '语', '言', '翻', '译',
  '知', '识', '老', '师', '学生', '大', '学', '生', '校', '园',
  '课', '桌', '椅', '纸', '笔', '书', '包', '时', '间', '分',
  '秒', '早', '午', '晚', '今', '天', '明', '月', '年', '岁'
]

const PREMIUM_COLORS = [
  { color: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)', name: 'Indigo' },
  { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)', name: 'Purple' },
  { color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)', name: 'Cyan' },
  { color: '#0EA5E9', glow: 'rgba(14, 165, 233, 0.4)', name: 'Sky Blue' },
  { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)', name: 'Gold' },
  { color: '#10B981', glow: 'rgba(16, 185, 129, 0.35)', name: 'Soft Emerald' },
]

type MotionGroup = 'A' | 'B' | 'C' | 'D'
type DepthLayer = 'background' | 'middle' | 'foreground'

interface FloatingCharacter {
  char: string
  x: number
  y: number
  duration: number
  delay: number
  motionGroup: MotionGroup
  depthLayer: DepthLayer
  opacity: number
  scale: number
  shouldRotate: boolean
  rotateAmount: number
  colorConfig: typeof PREMIUM_COLORS[0]
}

function generateFloatingCharacters(count: number): FloatingCharacter[] {
  return Array.from({ length: count }, () => {
    const rand = Math.random()
    const motionGroup: MotionGroup = rand < 0.3 ? 'A' : rand < 0.6 ? 'B' : rand < 0.8 ? 'C' : 'D'
    
    const rand2 = Math.random()
    const depthLayer: DepthLayer = rand2 < 0.4 ? 'background' : rand2 < 0.7 ? 'middle' : 'foreground'
    
    const shouldRotate = Math.random() < 0.125

    const layerConfigs = {
      background: { opacity: [0.08, 0.15, 0.15, 0.08] as const, scale: [0.6, 0.75, 0.75, 0.6] as const, duration: 70, speedMod: 1 },
      middle: { opacity: [0.15, 0.25, 0.25, 0.15] as const, scale: [0.8, 0.95, 0.95, 0.8] as const, duration: 55, speedMod: 1.3 },
      foreground: { opacity: [0.25, 0.4, 0.4, 0.25] as const, scale: [0.95, 1.1, 1.1, 0.95] as const, duration: 45, speedMod: 1.6 },
    }
    const layerConfig = layerConfigs[depthLayer]

    const groupConfigs = {
      A: { durationMod: 1, startPos: '-15vw', endPos: '115vw' },
      B: { durationMod: 1.25, startPos: '115vw', endPos: '-15vw' },
      C: { durationMod: 0.85, startPos: '-15vh', endPos: '115vh' },
      D: { durationMod: 1.4, startPos: '115vh', endPos: '-15vh' },
    }
    const groupConfig = groupConfigs[motionGroup]

    return {
      char: HSK_CHARACTERS[Math.floor(Math.random() * HSK_CHARACTERS.length)],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      duration: layerConfig.duration * groupConfig.durationMod + Math.random() * 20,
      delay: Math.random() * 20,
      motionGroup,
      depthLayer,
      opacity: layerConfig.opacity,
      scale: layerConfig.scale,
      shouldRotate,
      rotateAmount: -5 + Math.random() * 10,
      colorConfig: PREMIUM_COLORS[Math.floor(Math.random() * PREMIUM_COLORS.length)],
    }
  })
}

function FloatingCharacters() {
  const [characters] = useState(() => generateFloatingCharacters(50))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {characters.map((char, i) => {
        const getAnimation = () => {
          switch (char.motionGroup) {
            case 'A':
              return { translateX: ['-15vw', '115vw'] }
            case 'B':
              return { translateX: ['115vw', '-15vw'] }
            case 'C':
              return { translateY: ['-15vh', '115vh'] }
            case 'D':
              return { translateY: ['115vh', '-15vh'] }
          }
        }

        return (
          <motion.div
            key={i}
            className="absolute select-none"
            initial={{ opacity: 0 }}
            animate={{
              ...getAnimation(),
              opacity: char.opacity,
              scale: char.scale,
              rotate: char.shouldRotate ? [0, char.rotateAmount, 0, -char.rotateAmount, 0] : 0,
            }}
            transition={{
              duration: char.duration,
              delay: char.delay,
              repeat: Infinity,
              ease: 'linear',
              rotate: char.shouldRotate ? {
                duration: char.duration * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              } : {},
            }}
            style={{
              left: `${char.x}%`,
              top: `${char.y}%`,
            }}
          >
            <span
              className={
                char.depthLayer === 'foreground'
                  ? 'text-4xl md:text-5xl lg:text-6xl font-bold inline-block'
                  : char.depthLayer === 'middle'
                  ? 'text-3xl md:text-4xl lg:text-5xl font-bold inline-block'
                  : 'text-2xl md:text-3xl lg:text-4xl font-bold inline-block'
              }
              style={{
                color: char.colorConfig.color,
                textShadow: `
                  0 0 10px ${char.colorConfig.glow},
                  0 0 20px ${char.colorConfig.glow},
                  0 0 30px ${char.colorConfig.glow}
                `,
                filter: 'blur(0.3px)',
              }}
            >
              {char.char}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div
            className="flex items-center gap-2 shrink-0"
            whileHover={{ scale: 1.05 }}
          >
            <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
              HSK Learning
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 shrink-0">
            {['Home', 'Features', 'About'].map((item) => (
              <motion.button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative whitespace-nowrap"
                whileHover={{ y: -2 }}
              >
                {item}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium bg-blue-600 hover:bg-blue-700 dark:bg-violet-600 dark:hover:bg-violet-700 shadow-lg shadow-blue-600/25 dark:shadow-violet-600/25 hover:shadow-xl hover:shadow-blue-600/30 dark:hover:shadow-violet-600/30">
                Sign Up
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-3">
              {['Home', 'Features', 'About'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function scrollToSection(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const FEATURES = [
  { icon: Brain, title: 'Smart Vocabulary Learning', description: 'Adaptive algorithms with spaced repetition for efficient memorization of HSK vocabulary.' },
  { icon: BarChart3, title: 'Progress Analytics', description: 'Visualize your learning journey with detailed statistics and performance insights.' },
  { icon: Flame, title: 'Daily Learning Streaks', description: 'Build consistent habits with streak tracking and maintain your learning momentum.' },
]

function FeaturesSection() {
  const ref = useRef(null)

  return (
    <section id="features" ref={ref} className="w-full py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Powerful <span className="text-blue-600 dark:text-blue-400">Features</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to master Chinese vocabulary effectively
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-violet-500/10 hover:border-blue-300 dark:hover:border-violet-700 transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30"
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function JourneySection() {
  const steps = [
    { title: 'Create Account', description: 'Sign up and verify your email to get started' },
    { title: 'Learn Vocabulary', description: 'Explore HSK lessons organized by level' },
    { title: 'Complete Quizzes', description: 'Test your knowledge with interactive quizzes' },
    { title: 'Track Progress', description: 'Monitor your learning journey with analytics' },
    { title: 'Master HSK Levels', description: 'Progress from HSK 1 to HSK 6' },
  ]

  return (
    <section className="w-full py-20 md:py-28 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Your Learning <span className="text-blue-600 dark:text-blue-400">Journey</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Follow these steps to become fluent in Chinese
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-violet-500 to-blue-600 md:-translate-x-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex items-start gap-4 md:gap-6 mb-8 md:mb-10 pl-12 md:pl-0"
            >
              <div className="flex-1 min-w-0 md:text-center">
                <div className="w-full md:max-w-sm md:mx-auto bg-slate-50 dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">{step.description}</p>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.1, type: 'spring', stiffness: 200 }}
                className="absolute left-0 md:relative md:left-auto w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/40 z-10 shrink-0"
              >
                {i + 1}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  }).scrollYProgress

  useEffect(() => {
    const unsubscribe = isInView.on('change', (value) => {
      if (value > 0.2 && value < 0.8) {
        const target = Math.floor(end * value * 3)
        setCount(Math.min(target, end))
      }
    })
    return () => unsubscribe()
  }, [isInView, end])

  return (
    <span ref={ref} className="font-bold text-4xl md:text-5xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
      {count}{suffix}
    </span>
  )
}

function StatsSection() {
  const stats = [
    { end: 600, suffix: '+', label: 'Vocabulary Words' },
    { end: 6, suffix: '', label: 'HSK Levels' },
    { end: 100, suffix: '%', label: 'Cloud Sync' },
    { end: 24, suffix: '/7', label: 'Access Anywhere' },
  ]

  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Platform <span className="text-blue-600 dark:text-blue-400">Statistics</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Numbers that showcase our commitment to excellence
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              className="text-center"
            >
              <AnimatedCounter end={stat.end} suffix={stat.suffix} />
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const WHY_CHOOSE = [
  { icon: Brain, title: 'Modern Learning Experience', description: 'Cutting-edge technology for effective language acquisition' },
  { icon: Book, title: 'Personalized Learning', description: 'Tailored recommendations to match your skill level' },
  { icon: Flame, title: 'Track Achievements', description: 'Gamified learning with badges and milestones' },
  { icon: BarChart3, title: 'Mobile Friendly', description: 'Fully responsive design for learning on the go' },
]

function WhyChooseSection() {
  return (
    <section id="about" className="w-full py-20 md:py-28 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Why Choose <span className="text-blue-600 dark:text-blue-400">This Platform</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience the future of language learning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {WHY_CHOOSE.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="w-full flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-violet-700 transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30"
              >
                <item.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base md:text-lg mb-1 text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scale = useTransform(scrollY, [0, 400], [1, 0.8])

  return (
    <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50 to-violet-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 pt-16 md:pt-20">
      <FloatingCharacters />
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 md:mb-6">
            <span className="bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Master Chinese Vocabulary
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
              Faster with Smart Learning
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
        >
          Learn HSK vocabulary through interactive lessons, quizzes, progress tracking,
          achievements, and cloud synchronization.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(37, 99, 235, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all cursor-pointer inline-block whitespace-nowrap"
            >
              Get Started
            </motion.div>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => scrollToSection('features')}
            className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-violet-400 transition-all duration-300 whitespace-nowrap"
          >
            Learn More
            <ChevronDown className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-slate-400/30 dark:border-slate-500/30 flex items-start justify-center p-1.5 md:p-2"
        >
          <motion.div className="w-1 h-2 md:w-1.5 md:h-2.5 bg-slate-400/50 dark:bg-slate-500/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-15">
        {HSK_CHARACTERS.slice(0, 12).map((char, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl md:text-4xl lg:text-5xl font-bold text-white"
            initial={{ translateX: '-100%' }}
            animate={{ translateX: '110vw' }}
            transition={{
              duration: 35 + i * 4,
              delay: i * 2.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ top: `${(i * 8) % 100}%` }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6"
        >
          Start Your Chinese Learning Journey Today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base md:text-lg lg:text-xl text-white/80 mb-8 md:mb-10"
        >
          Join thousands of learners mastering Chinese vocabulary the smart way
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-white text-blue-600 rounded-full shadow-xl cursor-pointer inline-block whitespace-nowrap"
            >
              Create Account
            </motion.div>
          </Link>
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-white border-2 border-white/30 hover:bg-white/10 rounded-full cursor-pointer inline-block whitespace-nowrap transition-all duration-300"
            >
              Login
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="w-full py-10 md:py-12 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
                HSK Learning
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-md text-sm md:text-base leading-relaxed">
              Master Chinese vocabulary with smart learning techniques, interactive quizzes, and cloud synchronization.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
              <li><Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link></li>
              <li><Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-slate-900 dark:text-white">Features</h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
              <li>Vocabulary Learning</li>
              <li>Interactive Quizzes</li>
              <li>Progress Tracking</li>
              <li>Cloud Sync</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-500 text-sm md:text-base">
          <p>© 2026 HSK Vocabulary Learning App. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden overflow-y-auto">
      <Navbar />
      <main className="w-full">
        <HeroSection />
        <FeaturesSection />
        <JourneySection />
        <StatsSection />
        <WhyChooseSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}