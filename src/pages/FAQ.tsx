import React from 'react';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ: React.FC = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('faq.question1'),
      answer: t('faq.answer1'),
    },
    {
      question: t('faq.question2'),
      answer: t('faq.answer2'),
    },
    {
      question: t('faq.question3'),
      answer: t('faq.answer3'),
    },
    {
      question: t('faq.question4'),
      answer: t('faq.answer4'),
    },
    {
      question: t('faq.question5'),
      answer: t('faq.answer5'),
    },
    {
      question: t('faq.question6'),
      answer: t('faq.answer6'),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto p-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">{t('faq.title')}</h1>
        <p className="text-center text-muted-foreground mb-12">
          {t('faq.subtitle')}
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-2">{t('faq.stillHaveQuestions')}</h2>
          <p className="text-muted-foreground mb-4">{t('faq.contactMessage')}</p>
          <a href="/contact" className="text-primary hover:underline font-medium">
            {t('footer.contactUs')} →
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;

