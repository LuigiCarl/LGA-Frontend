import React, { createContext, useContext, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsContextType {
  showTermsModal: (onAccept?: () => void, onDecline?: () => void) => void;
  hideTermsModal: () => void;
  isTermsModalOpen: boolean;
}

const TermsContext = createContext<TermsContextType | undefined>(undefined);

export function useTerms() {
  const context = useContext(TermsContext);
  if (context === undefined) {
    throw new Error('useTerms must be used within a TermsProvider');
  }
  return context;
}

interface TermsProviderProps {
  children: React.ReactNode;
}

export function TermsProvider({ children }: TermsProviderProps) {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [onAcceptCallback, setOnAcceptCallback] = useState<(() => void) | undefined>();
  const [onDeclineCallback, setOnDeclineCallback] = useState<(() => void) | undefined>();

  const showTermsModal = (onAccept?: () => void, onDecline?: () => void) => {
    setOnAcceptCallback(() => onAccept);
    setOnDeclineCallback(() => onDecline);
    setIsTermsModalOpen(true);
  };

  const hideTermsModal = () => {
    setIsTermsModalOpen(false);
    setOnAcceptCallback(undefined);
    setOnDeclineCallback(undefined);
  };

  const handleAccept = () => {
    onAcceptCallback?.();
    hideTermsModal();
  };

  const handleDecline = () => {
    onDeclineCallback?.();
    hideTermsModal();
  };

  const termsContent = `
# Terms and Conditions

**Last updated: December 10, 2025**

## 1. Introduction

Welcome to FinanEase ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our personal finance management application and services.

## 2. Acceptance of Terms

By accessing or using FinanEase, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not use our service.

## 3. Service Description

FinanEase is a personal finance management application that helps you track income, expenses, budgets, and financial goals.

## 4. User Accounts

- You must create an account to use our services
- You are responsible for maintaining the confidentiality of your account information
- You must provide accurate, current, and complete information
- You are responsible for all activities under your account

## 5. Data and Privacy

- We collect and process your financial data to provide our services
- Your data is encrypted and stored securely
- We do not share your personal financial information with third parties without consent
- You can delete your account and data at any time

## 6. Acceptable Use

You agree not to:
- Use the service for illegal activities
- Attempt to gain unauthorized access to our systems
- Interfere with the proper functioning of the service
- Upload malicious code or content

## 7. Service Availability

- We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service
- We may perform maintenance that temporarily affects service availability
- We reserve the right to modify or discontinue features with notice

## 8. Limitation of Liability

FinanEase is provided "as is" without warranties. We are not liable for:
- Data loss or corruption
- Financial decisions made based on our service
- Indirect, incidental, or consequential damages

## 9. Account Termination

- You may terminate your account at any time
- We may suspend or terminate accounts for Terms violations
- Upon termination, your data will be deleted within 30 days

## 10. Changes to Terms

We may update these Terms periodically. We will notify you of material changes via email or in-app notification.

## 11. Contact Information

For questions about these Terms, contact us at:
- Email: finanease@gmail.com
- Address: Sorsogon State University - Bulan Campus

## 12. Governing Law

These Terms are governed by the laws of [Your Jurisdiction].
  `.trim();

  return (
    <TermsContext.Provider value={{ showTermsModal, hideTermsModal, isTermsModalOpen }}>
      {children}
      
      {/* Terms Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDecline}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div
                className="bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-[#0A0A0A] dark:text-white">Terms and Conditions</h3>
                  </div>
                  <button
                    onClick={handleDecline}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                  >
                    <X className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {termsContent.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return (
                          <h1 key={index} className="text-xl font-bold text-[#0A0A0A] dark:text-white mb-4 mt-6 first:mt-0">
                            {line.substring(2)}
                          </h1>
                        );
                      } else if (line.startsWith('## ')) {
                        return (
                          <h2 key={index} className="text-lg font-semibold text-[#0A0A0A] dark:text-white mb-3 mt-5">
                            {line.substring(3)}
                          </h2>
                        );
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={index} className="font-semibold text-[#0A0A0A] dark:text-white mb-2">
                            {line.substring(2, line.length - 2)}
                          </p>
                        );
                      } else if (line.startsWith('- ')) {
                        return (
                          <li key={index} className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-1 ml-4">
                            {line.substring(2)}
                          </li>
                        );
                      } else if (line.trim()) {
                        return (
                          <p key={index} className="text-sm text-[#717182] dark:text-[#A1A1AA] mb-3 leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      return <br key={index} />;
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-black/10 dark:border-white/10">
                  <button
                    onClick={handleDecline}
                    className="flex-1 h-10 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white text-sm rounded-lg hover:bg-[#F3F3F5] dark:hover:bg-[#18181B] transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 h-10 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity"
                  >
                    Accept Terms
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </TermsContext.Provider>
  );
}