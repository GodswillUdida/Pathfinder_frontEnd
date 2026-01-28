import { Clock, Users, Star, BookOpen, TrendingUp, Award } from "lucide-react";
import Image from "next/image";

const courses = [
  {
    id: 1,
    title: "Fundamentals of Accounting",
    description:
      "A complete starter program covering double-entry, journals, ledgers, trial balance, and financial statements.",
    instructor: "CPA Mary Thompson",
    duration: "6 weeks",
    students: 4021,
    rating: 4.9,
    level: "Beginner",
    category: "Accounting",
    image:
      "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=800&q=80",
    price: "₦45,000",
    badge: "Bestseller",
  },
  {
    id: 2,
    title: "Bookkeeping & Payroll Management",
    description:
      "Learn payroll processing, salary structures, statutory deductions, PAYE, pension, and recordkeeping.",
    instructor: "Adewale Adebayo, FCA",
    duration: "8 weeks",
    students: 2710,
    rating: 4.8,
    level: "Intermediate",
    category: "Finance",
    image:
      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80",
    price: "₦55,000",
    badge: "Popular",
  },
  {
    id: 3,
    title: "Financial Reporting (IFRS)",
    description:
      "Master IFRS standards, statement preparation, notes, consolidations, and real-world reporting formats.",
    instructor: "Grace Uchenna, ACCA",
    duration: "10 weeks",
    students: 1987,
    rating: 4.9,
    level: "Advanced",
    category: "Accounting",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
    price: "₦60,000",
    badge: "Featured",
  },
  {
    id: 4,
    title: "Taxation & Compliance",
    description:
      "A practical guide on Nigerian tax laws, VAT, CIT, PIT, compliance, filings, and corporate tax planning.",
    instructor: "Dr. Emmanuel Nwachukwu",
    duration: "7 weeks",
    students: 1498,
    rating: 4.7,
    level: "All Levels",
    category: "Taxation",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGF4YXRpb258ZW58MHx8MHx8fDA%3D",
    price: "₦50,000",
    badge: "Trending",
  },
  {
    id: 5,
    title: "Audit & Internal Control",
    description:
      "Learn auditing procedures, risk assessment, sampling, documentation, and system controls.",
    instructor: "Chinonso Okafor, CPA",
    duration: "8 weeks",
    students: 1274,
    rating: 4.8,
    level: "Intermediate",
    category: "Audit",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXVkaXR8ZW58MHx8MHx8fDA%3D",
    price: "₦58,000",
    badge: "Professional",
  },
];

const CoursePreview = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4" />
            <span>Featured Programs</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-manrope">
            Build Real Accounting Skills
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-manrope">
            Practical, industry-aligned accounting training built for beginners,
            job-seekers, and professionals upgrading their career.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {course.badge && (
                <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  {course.badge}
                </div>
              )}

              {/* Image */}
              <div className="relative h-44 bg-gray-200 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  width={400}
                  height={180}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {course.level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-manrope group-hover:text-blue-600">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center mb-4 text-sm text-gray-700">
                  <Award className="h-4 w-4 mr-2 text-gray-400" />
                  {course.instructor}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      {course.students.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center font-semibold text-gray-900">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                    {course.rating}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    {course.price}
                  </span>
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <BookOpen className="h-4 w-4" />
                    <span>Enroll</span>
                  </button>
                </div>
              </div>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="inline-flex items-center space-x-2 bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all">
            <BookOpen className="h-5 w-5" />
            <span>Browse All Programs</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoursePreview;
