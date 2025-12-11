export type NavLink = {
  name: string;
  href?: string;
  dropdown?: {
    title: string;
    href: string;
    description: string;
  }[];
};

export const navLinks: NavLink[] = [
  { name: "HOME", href: "/" },
  { name: "ABOUT US", href: "/about" },
  {
    name: "COURSES",
    href: "/courses",
    // dropdown: [
    //   {
    //     title:"Diplomas",
    //     href: "/courses/diploma",
    //     description:"DIPLOMA programs"
    //   }
    // ]
  },
  { name: "CONTACT US", href: "/contact" },
  { name: "GALLERY", href: "/gallery" },

  // {
  //   name: "ICAN",
  //   href: "/courses/ican",
  //   dropdown: [
  //     {
  //       title: "ATS Level 1",
  //       href: "/courses/ican/ats-1",
  //       description: "Introductory Technical Skills",
  //     },
  //     {
  //       title: "ATS Level 2",
  //       href: "/courses/ican/ats-2",
  //       description: "Intermediate Technical Skills",
  //     },
  //     {
  //       title: "ATS Level 3",
  //       href: "/courses/ican/ats-3",
  //       description: "Advanced Technical Skills",
  //     },
  //     {
  //       title: "Foundation Level",
  //       href: "/courses/ican/foundation",
  //       description: "Foundation 1–3",
  //     },
  //     {
  //       title: "Skills Level",
  //       href: "/courses/ican/skills",
  //       description: "Skills 1–3",
  //     },
  //     {
  //       title: "Professional Level",
  //       href: "/courses/ican/professional",
  //       description: "Professional 1–3",
  //     },
  //     {
  //       title: "Physical Classes",
  //       href: "/courses/ican/physical-classes",
  //       description: "In-person training experience",
  //     },
  //   ],
  // },
  // {
  //   name: "Online Courses",
  //   href: "/courses/online",
  // },
  // {
  //   name: "DIPLOMA PROGRAMS",
  //   href: "/courses/diploma",
  //   dropdown: [
  //     {
  //       title: "Diploma in Accounting",
  //       href: "/courses/diploma/accounting",
  //       description:
  //         "Learn practical accounting with real-world applications.",
  //     },
  //     {
  //       title: "Diploma in human Resource Management",
  //       href: "/courses/diploma/hrm",
  //       description: "Business management principles and practices",
  //     },
  //     {
  //       title: "Diploma in IFRS",
  //       href: "/courses/diploma/ifrs",
  //       description: "Comprehensive understanding of International Financial Reporting Standards (IFRS).",
  //     },
  //     {
  //       title: "Diploma in PM",
  //       href: "/courses/diploma/pm",
  //       description: "Project management methodologies and tools.",
  //     },
  //     {
  //       title: "Diploma in Acct. Software",

  //       href: "/courses/diploma/Accounting-Software",
  //       description: "Hands-on training with popular accounting software.",
  //     },
  //   ],
  // },

  // { name: "Admin", href: "/admin" },
];
