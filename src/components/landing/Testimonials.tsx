"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Adebayo Oluwaseun",
    role: "Certified Accountant",
    company: "PwC Nigeria",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adebayo",
    rating: 5,
    text: "The ICAN preparation program at Accountant Pathfinder was exceptional. The instructors are knowledgeable, and the study materials are comprehensive. I passed all my exams on the first attempt!",
    course: "ICAN Professional Level",
  },
  {
    id: 2,
    name: "Chioma Nwankwo",
    role: "Financial Analyst",
    company: "GTBank",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma",
    rating: 5,
    text: "The online taxation course transformed my career. The flexible schedule allowed me to learn while working full-time. The practical examples were directly applicable to my job.",
    course: "Advanced Taxation",
  },
  {
    id: 3,
    name: "Ibrahim Mohammed",
    role: "Business Owner",
    company: "Ibrahim & Sons Ltd",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim",
    rating: 5,
    text: "As a business owner, the financial management diploma gave me the skills to properly manage my company's finances. The instructors were patient and explained complex concepts clearly.",
    course: "Financial Management Diploma",
  },
  {
    id: 4,
    name: "Blessing Okafor",
    role: "Audit Senior",
    company: "KPMG Nigeria",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Blessing",
    rating: 5,
    text: "The quality of education here is world-class. The mentorship program connected me with industry professionals who guided my career path. I'm now working at one of the Big 4 firms!",
    course: "Audit & Assurance",
  },
  {
    id: 5,
    name: "Emeka Eze",
    role: "Tax Consultant",
    company: "Self-Employed",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka",
    rating: 5,
    text: "The practical approach to teaching tax compliance and planning was outstanding. I now run my own successful tax consultancy practice thanks to the skills I learned here.",
    course: "Tax Compliance & Planning",
  },
  {
    id: 6,
    name: "Fatima Abubakar",
    role: "CFO",
    company: "Dangote Group",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    rating: 5,
    text: "The strategic financial management course elevated my career to the C-suite level. The case studies and real-world applications were invaluable for my professional growth.",
    course: "Strategic Financial Management",
  },
];


const fallback = "/AP-Logo-5-(1).svg"; 

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-6 border border-blue-200 dark:border-blue-800"
          >
            <Star className="w-4 h-4 fill-current" />
            Student Success Stories
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of successful professionals who transformed their
            careers with our world-class training programs.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative overflow-hidden">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="grid md:grid-cols-2 gap-8 lg:gap-12"
            >
              {/* Featured Testimonial - Large Card */}
              <Card className="md:col-span-1 bg-white dark:bg-gray-900 border-2 border-blue-200 dark:border-blue-800 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-8 lg:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <Quote className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-50" />
                    <div className="flex gap-1">
                      {Array.from({
                        length: testimonials[currentIndex].rating,
                      }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8">
                    {testimonials[currentIndex].text}
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                        <Image
                          src={testimonials[currentIndex].image}
                          alt={testimonials[currentIndex].name}
                          width={64}
                          height={64}
                          priority
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = fallback)}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonials[currentIndex].role}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {testimonials[currentIndex].company}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Course Completed:{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {testimonials[currentIndex].course}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Testimonials - Smaller Cards */}
              <div className="md:col-span-1 space-y-6">
                {[1, 2].map((offset) => {
                  const index = (currentIndex + offset) % testimonials.length;
                  return (
                    <Card
                      key={testimonials[index].id}
                      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => handleDotClick(index)}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-1 mb-3">
                          {Array.from({
                            length: testimonials[index].rating,
                          }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                          {testimonials[index].text}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 p-0.5">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                              <Image
                                src={testimonials[index].image}
                                alt={testimonials[index].name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 dark:text-white truncate">
                              {testimonials[index].name}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {testimonials[index].role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8 lg:mt-12">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? "w-8 h-2 bg-blue-600 dark:bg-blue-400"
                      : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 mt-16 lg:mt-20"
        >
          {[
            { value: "500+", label: "Students Trained" },
            { value: "95%", label: "Success Rate" },
            { value: "20+", label: "Expert Instructors" },
            { value: "4.9/5", label: "Average Rating" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
