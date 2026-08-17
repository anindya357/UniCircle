import type { HomeOverview } from "@/features/home/types/home-overview";

export const mockHomeOverview = {
  hero: {
    eyebrow: "Discover your university",
    title: "Welcome to CUET Campus",
    description:
      "A hillside community where engineering, technology, research, and campus life move forward together.",
  },
  facts: [
    { id: "founded", value: "1968", label: "First academic session" },
    { id: "university", value: "2003", label: "Became CUET" },
    { id: "location", value: "Raozan", label: "Chattogram, Bangladesh" },
    { id: "focus", value: "STEM", label: "Engineering and technology" },
  ],
  introduction: {
    title: "Engineering knowledge in a remarkable natural setting",
    paragraphs: [
      "Chittagong University of Engineering & Technology is a leading public engineering university in Bangladesh. Its campus sits beside the Chattogram–Kaptai road, about 25 kilometres from central Chattogram.",
      "CUET brings academic study together with research, practical learning, student organizations, and a close connection to the industrial landscape of southeast Bangladesh.",
    ],
  },
  history: [
    {
      id: "decision",
      year: "1962",
      title: "The institution is conceived",
      description:
        "The National Economic Council decided to establish Engineering College, Chittagong to help meet the need for professional engineers.",
    },
    {
      id: "first-session",
      year: "1968",
      title: "The first academic session begins",
      description:
        "Engineering College, Chittagong started its first session with 120 students under the Faculty of Engineering, University of Chittagong.",
    },
    {
      id: "bit",
      year: "1986",
      title: "A self-degree-awarding institute",
      description:
        "The college became Bangladesh Institute of Technology (BIT), Chittagong under the BIT ordinance.",
    },
    {
      id: "cuet",
      year: "2003",
      title: "CUET takes its present name",
      description:
        "The institute was converted into Chittagong University of Engineering & Technology under the CUET Act.",
    },
  ],
  achievements: [
    {
      id: "legacy",
      marker: "01",
      title: "Five decades of impact",
      description:
        "CUET has developed engineers, researchers, and professionals who contribute in Bangladesh and around the world.",
    },
    {
      id: "research",
      marker: "02",
      title: "Research across disciplines",
      description:
        "Its work spans renewable energy, intelligent computing, robotics, biomedical engineering, infrastructure, water, and disaster management.",
    },
    {
      id: "industry",
      marker: "03",
      title: "Industry-connected learning",
      description:
        "Proximity to Chattogram's port and industrial region creates opportunities to connect engineering education with real-world problems.",
    },
    {
      id: "community",
      marker: "04",
      title: "A growing innovation community",
      description:
        "Academic conferences, student organizations, research partnerships, and alumni networks extend learning beyond the classroom.",
    },
  ],
  facilities: [
    {
      id: "academic",
      marker: "AC",
      title: "Academic and research spaces",
      description:
        "Departmental laboratories, institutes, and research centres support practical learning and investigation.",
    },
    {
      id: "library",
      marker: "LB",
      title: "Library and e-resources",
      description:
        "Central learning resources help students and researchers find books, journals, reports, and digital materials.",
    },
    {
      id: "residential",
      marker: "HL",
      title: "Residential campus life",
      description:
        "Student halls and shared campus spaces create a community for study, collaboration, and everyday life.",
    },
    {
      id: "wellbeing",
      marker: "WB",
      title: "Health and wellbeing",
      description:
        "Medical, sports, welfare, and recreation services support life beyond academic work.",
    },
    {
      id: "transport",
      marker: "TR",
      title: "Campus transport",
      description:
        "University transport connects the campus with routes serving students, teachers, and staff.",
    },
    {
      id: "organizations",
      marker: "SO",
      title: "Student organizations",
      description:
        "Technical, cultural, professional, and service organizations give students room to lead and create.",
    },
  ],
  gallery: [
    {
      id: "cuet-landmark",
      src: "/media/home/cuet-gate.jpg",
      alt: "CUET landmark built from white structural forms and a golden gear",
      caption: "A familiar CUET landmark",
    },
    {
      id: "it-business-incubator",
      src: "/media/home/cuet-it-business-incubator.png",
      alt: "The rounded blue and white IT Business Incubator building at CUET",
      caption: "CUET IT Business Incubator",
    },
  ],
  video: {
    title: "Take a virtual walk through CUET",
    description:
      "See academic buildings, green spaces, landmarks, and everyday campus life in this CUET introduction video.",
    src: "/media/home/cuet-introduction.mp4",
    poster: "/media/home/cuet-gate.jpg",
    fallbackLabel: "Open the CUET introduction video",
  },
  sources: [
    { label: "Official CUET website", url: "https://cuet.ac.bd/" },
    {
      label: "Official CUET institutional bulletin",
      url: "https://cuet.ac.bd/compressed/Final%20UG%20Bulletin%202022.pdf",
    },
  ],
} as const satisfies HomeOverview;
