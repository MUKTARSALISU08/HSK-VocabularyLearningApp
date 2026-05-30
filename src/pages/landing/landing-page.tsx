import { useState, useEffect, useRef } from 'react'
import { Link } from 'wouter'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown, Book, Brain, Flame, Heart, BarChart3, Smartphone, Shield } from 'lucide-react'

const HSK_CHARACTERS = [
  '你', '我', '他', '她', '学', '习', '中', '国', '人', '朋',
  '友', '谢', '欢', '迎', '好', '家', '爱', '看', '说', '听',
  '读', '写', '字', '词', '句', '文', '语', '言', '翻', '译',
  '知', '识', '老', '师', '学生', '大', '学', '生', '校', '园',
  '课', '桌', '椅', '纸', '笔', '书', '包', '时', '间', '分',
  '秒', '早', '午', '晚', '今', '天', '明', '月', '年', '岁'
]

interface FloatingCharacter {
  char: string
  x: number
  y: number
  duration: number
  delay: number
  direction: 'left' | 'right' | 'up' | 'down'
  opacity: number
  scale: number
  rotate: number
}

function generateFloatingCharacters(count: number): FloatingCharacter[] {
  return Array.from({ length: count }, () => ({
    char: HSK_CHARACTERS[Math.floor(Math.random() * HSK_CHARACTERS.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 10,
    direction: ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)] as FloatingCharacter['direction'],
    opacity: 0.25 + Math.random() * 0.4,
    scale: 0.8 + Math.random() * 1.2,
    rotate: -15 + Math.random() * 30,
  }))
}

function FloatingCharacters() {
  const [characters] = useState(() => generateFloatingCharacters(60))
  const constraintsRef = useRef(null)

  return (
    <div ref={constraintsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {characters.map((char, i) => {
          const getAnimation = () => {
            switch (char.direction) {
              case 'left':
                return { x: [-100, window.innerWidth + 100] }
              case 'right':
                return { x: [window.innerWidth + 100, -100] }
              case 'up':
                return { y: [window.innerHeight + 100, -100] }
              case 'down':
                return { y: [-100, window.innerHeight + 100] }
            }
          }

          return (
            <motion.div
              key={i}
              className="absolute select-none"
              style={{ left: `${char.x}%`, top: `${char.y}%` }}
              initial={{ opacity: 0 }}
              animate={{
                ...getAnimation(),
                opacity: [0, char.opacity, char.opacity, 0],
                scale: [0.5, char.scale, char.scale, 0.5],
                rotate: [0, char.rotate],
              }}
              transition={{
                duration: char.duration,
                delay: char.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <span
                className="text-5xl md:text-6xl lg:text-7xl font-bold inline-block"
                style={{
                  color: `rgba(147, 51, 234, ${char.opacity})`,
                  textShadow: `
                    0 0 10px rgba(147, 51, 234, ${char.opacity * 0.8}),
                    0 0 20px rgba(147, 51, 234, ${char.opacity * 0.6}),
                    0 0 40px rgba(147, 51, 234, ${char.opacity * 0.4}),
                    0 0 60px rgba(147, 51, 234, ${char.opacity * 0.2})
                  `,
                }}
              >
                {char.char}
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>
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
        isScrolled ? 'bg-background/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Book className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              HSK Learning
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'About'].map((item) => (
              <motion.button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative"
                whileHover={{ y: -2 }}
              >
                {item}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary"
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                Sign Up
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
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
            className="md:hidden bg-background/95 backdrop-blur-lg border-t overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {['Home', 'Features', 'About'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button className="w-full">Sign Up</Button>
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
  { icon: Brain, title: 'Smart Vocabulary Learning', description: 'Adaptive learning algorithms help you memorize HSK words efficiently using spaced repetition.' },
  { icon: Book, title: 'Interactive Quizzes', description: 'Test your knowledge with various quiz types including multiple choice, matching, and fill-in-the-blank.' },
  { icon: Flame, title: 'Daily Learning Streaks', description: 'Build consistent learning habits with streak tracking and daily goals.' },
  { icon: Heart, title: 'Favorites Collection', description: 'Save words you find difficult to your favorites for focused review.' },
  { icon: BarChart3, title: 'Progress Analytics', description: 'Visualize your learning journey with detailed statistics and charts.' },
  { icon: Smartphone, title: 'Responsive Design', description: 'Learn anywhere on any device - desktop, tablet, or mobile.' },
  { icon: Shield, title: 'Secure Authentication', description: 'Your data is protected with enterprise-grade security and email verification.' },
]

function FeaturesSection() {
  const ref = useRef(null)

  return (
    <section id="features" ref={ref} className="py-20 md:py-28 bg-muted/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Powerful <span className="text-primary">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Everything you need to master Chinese vocabulary effectively
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="bg-card rounded-2xl p-5 md:p-6 border shadow-sm hover:shadow-lg transition-shadow"
            >
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
              >
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </motion.div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
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
    <section className="py-20 md:py-28 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Your Learning <span className="text-primary">Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Follow these steps to become fluent in Chinese
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex items-start gap-4 md:gap-6 mb-8 md:mb-10 pl-12 md:pl-0"
            >
              <div className="flex-1 md:text-center">
                <div className="bg-card rounded-xl p-4 md:p-6 border shadow-sm inline-block w-full md:max-w-sm">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.1 }}
                className="absolute left-0 md:relative md:left-auto md:translate-x-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 z-10 shrink-0"
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
    <span ref={ref} className="font-bold text-4xl md:text-5xl text-primary">
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
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Platform <span className="text-primary">Statistics</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Numbers that showcase our commitment to excellence
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <AnimatedCounter end={stat.end} suffix={stat.suffix} />
              <p className="text-muted-foreground mt-2 text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const WHY_CHOOSE = [
  { icon: Brain, title: 'Modern Learning Experience', description: 'Cutting-edge technology for effective language acquisition' },
  { icon: Smartphone, title: 'Learn Anywhere', description: 'Study on desktop, tablet, or mobile - your choice' },
  { icon: Book, title: 'Personalized Learning', description: 'AI-powered recommendations tailored to your level' },
  { icon: Shield, title: 'Mobile Friendly', description: 'Fully responsive design for learning on the go' },
]

function WhyChooseSection() {
  return (
    <section id="about" className="py-20 md:py-28 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">This Platform</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Experience the future of language learning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {WHY_CHOOSE.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-3 md:gap-4 p-4 md:p-6 rounded-2xl bg-card border shadow-sm"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
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
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      <FloatingCharacters />
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 md:mb-6">
            <span className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
              Master Chinese Vocabulary
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Faster with Smart Learning
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-4"
        >
          Learn HSK vocabulary through interactive lessons, quizzes, progress tracking,
          achievements, favorites, mistake review, and cloud synchronization.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(147, 51, 234, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 transition-all cursor-pointer inline-block"
            >
              Get Started
            </motion.div>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => scrollToSection('features')}
            className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full border-2 hover:bg-primary/5 w-full sm:w-auto"
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
          className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5 md:p-2"
        >
          <motion.div className="w-1 h-2 md:w-1.5 md:h-2.5 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {HSK_CHARACTERS.slice(0, 15).map((char, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl md:text-6xl lg:text-7xl font-bold text-white"
            initial={{ x: -100 }}
            animate={{
              x: [null, window.innerWidth + 100],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ top: `${Math.random() * 100}%` }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
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
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-white text-primary rounded-full shadow-lg cursor-pointer inline-block w-full sm:w-auto"
            >
              Create Account
            </motion.div>
          </Link>
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-white border-2 border-white/30 hover:bg-white/10 rounded-full cursor-pointer inline-block w-full sm:w-auto"
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
    <footer className="py-10 md:py-12 border-t overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">HSK Learning</span>
            </div>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Master Chinese vocabulary with smart learning techniques, interactive quizzes, and cloud synchronization.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
              <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
              <li><Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
              <li>Vocabulary Learning</li>
              <li>Interactive Quizzes</li>
              <li>Progress Tracking</li>
              <li>Cloud Sync</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t text-center text-muted-foreground text-sm md:text-base">
          <p>© 2026 HSK Vocabulary Learning App. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
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