import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  PieChart, 
  Bell,
  CreditCard,
  Target,
  CheckCircle2,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BeamsBackground } from './ui/beams-background';

export function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Manual Account Tracking",
      description: "Add your accounts by name and balance. Update them when you want. No automatic connections needed."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Custom Categories",
      description: "Create spending categories that match your life. Organize transactions exactly how you think about money."
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Visual Reports",
      description: "See your spending at a glance with clean charts and graphs. Understand your patterns instantly."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Optional Notifications",
      description: "Get reminders about your budget if you want them. Completely optional, completely customizable."
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Add Your Accounts",
      description: "Manually add your bank accounts, credit cards, and cash. Simple one-time setup that takes just a minute.",
      icon: <CreditCard className="w-8 h-8" />
    },
    {
      step: "02",
      title: "Create Your Categories",
      description: "Set up spending categories that make sense for your life—groceries, rent, entertainment, savings, you name it.",
      icon: <Target className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Track Your Spending",
      description: "Add transactions as they happen or update weekly. See exactly where your money goes with clear, visual reports.",
      icon: <TrendingUp className="w-8 h-8" />
    }
  ];

  const benefits = [
    {
      stat: "5 min",
      label: "To get started",
      description: "Quick setup, no complexity"
    },
    {
      stat: "100%",
      label: "Control",
      description: "You enter everything, you see everything"
    },
    {
      stat: "Zero",
      label: "Bank connections",
      description: "Manual entry = full privacy"
    }
  ];

  const testimonials = [
    {
      name: "Alex M.",
      role: "Early Beta User",
      avatar: "AM",
      quote: "Love how simple it is. I just add my expenses weekly and instantly see where I'm overspending. No bells and whistles, just clarity.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Jordan K.",
      role: "Beta Tester",
      avatar: "JK",
      quote: "The manual entry might sound old-school, but it actually makes me more aware of every purchase. That awareness alone has helped me save.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Casey R.",
      role: "Early User",
      avatar: "CR",
      quote: "I tried the 'smart' budget apps and they were overwhelming. FinanEase is refreshingly straightforward—exactly what I needed.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BeamsBackground />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <img 
              src="/icon.png" 
              alt="FinanEase" 
              className="w-20 h-20 drop-shadow-2xl"
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Simple, Transparent Budget Tracking
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Budget Smarter,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Not Harder
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            A straightforward budget tracker that respects your privacy. 
            Manual tracking means full control—no bank connections, no automation, just clarity.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/signin')}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              Start Budgeting for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-lg hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
            >
              See How It Works
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>10,000+ Users</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-2 bg-gray-400 dark:bg-gray-600 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
              The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Budgeting Shouldn't Feel Like a <span className="text-red-500">Full-Time Job</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              You're trying to be responsible with money, but...
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                problem: "Budget apps want your bank login",
                impact: "Privacy concerns and security risks"
              },
              {
                problem: "Automatic tracking feels invasive",
                impact: "You want control over your data"
              },
              {
                problem: "Other apps are too complex",
                impact: "30 features you'll never use"
              },
              {
                problem: "You forget to check your budget",
                impact: "Overspending without realizing it"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 bg-red-500 rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.problem}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      → {item.impact}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full mb-8">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                FinanEase makes it simple
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Manual Entry, Complete Control
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
              Add your accounts, categories, and transactions yourself. See exactly where your money goes—no automatic connections required.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-6 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple Tools for Clear Results
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              No complexity, no confusion—just straightforward budgeting that makes sense.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setActiveFeature(index)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl scale-105'
                    : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  activeFeature === index
                    ? 'bg-white/20'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${
                  activeFeature === index ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {feature.title}
                </h3>
                <p className={activeFeature === index ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Benefits Stats */}
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl border border-gray-200 dark:border-gray-800"
              >
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {benefit.stat}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50 dark:bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From signup to insight in less than 5 minutes.
            </p>
          </div>

          <div className="space-y-12">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex flex-col md:flex-row items-center gap-8"
              >
                <div className={`flex-1 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                        {step.step}
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-500 flex items-center justify-center bg-white dark:bg-gray-900">
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-6 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
              What Users Say
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Early Feedback from Beta Testers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Hear from users who are testing FinanEase in early access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <Shield className="w-20 h-20 mx-auto mb-6 text-blue-500" />
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Privacy, Your Data
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Because you enter everything manually, your banking credentials never touch our servers. 
            Your data stays yours—we just help you organize it.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8" />,
                title: "No Bank Logins",
                description: "Never share your passwords with us"
              },
              {
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "You Control Everything",
                description: "What you enter is what you see"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Encrypted Storage",
                description: "Industry-standard data protection"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6 overflow-hidden">
        <BeamsBackground />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Join others who prefer simple, manual budget tracking with full privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/signin')}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl text-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-3"
              >
                <DollarSign className="w-6 h-6" />
                Start Budgeting for Free
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2025 FinanEase. All rights reserved.</p>
          <p className="mt-2">Made with ❤️ for people who want to be good with money</p>
        </div>
      </footer>
    </div>
  );
}
