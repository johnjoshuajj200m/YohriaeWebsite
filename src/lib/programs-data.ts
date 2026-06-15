import { PROGRAM_IMAGES } from "@/assets/images";
import { Brain, GraduationCap, Heart, Megaphone, Scale, Shield, Sprout, Users } from "lucide-react";

export const PROGRAMS: {
  Icon: typeof Heart;
  title: string;
  tagline: string;
  body: string;
  focus: string[];
  imageKey: keyof typeof PROGRAM_IMAGES;
  stat: string;
  outcome: string;
  category: string;
  featured?: boolean;
}[] = [
  {
    Icon: Heart,
    title: "Health Education",
    imageKey: "health",
    category: "Health",
    featured: true,
    tagline: "Promoting healthy communities and improved access to care",
    stat: "1,800+ people reached",
    outcome: "Better health literacy, safer choices, and stronger referral pathways.",
    body: "We improve health and well-being by increasing access to information, services, and support — across HIV, SRHR, mental health, and community health.",
    focus: [
      "HIV prevention, testing & treatment",
      "Sexual & reproductive health and rights",
      "Mental health & psychosocial support",
      "Health systems strengthening",
      "Referral & linkage to care",
    ],
  },
  {
    Icon: Scale,
    title: "Human Rights Advocacy",
    imageKey: "rights",
    category: "Advocacy",
    featured: true,
    tagline: "Dignity, equality and inclusion",
    stat: "30+ empowerment sessions",
    outcome: "Communities understand rights, reporting options, and protection routes.",
    body: "We advance rights, challenge discrimination, and strengthen protection mechanisms for those most at risk.",
    focus: [
      "Human rights education",
      "Legal empowerment",
      "Documentation & reporting",
      "Access to justice",
      "Community-based advocacy",
    ],
  },
  {
    Icon: Sprout,
    title: "Leadership Development",
    imageKey: "leadership",
    category: "Youth",
    tagline: "Equipping young people to lead and thrive",
    stat: "450+ youth engaged",
    outcome: "Young people gain practical confidence, civic voice, and peer leadership skills.",
    body: "Leadership, skills, and opportunities so young people become active contributors to their communities and economy.",
    focus: [
      "Leadership development",
      "Vocational & livelihood skills",
      "Entrepreneurship development",
      "Civic engagement",
      "Mentorship & career guidance",
    ],
  },
  {
    Icon: Users,
    title: "Community Outreach",
    imageKey: "outreach",
    category: "Community",
    tagline: "Empowering communities through knowledge and participation",
    stat: "20+ communities served",
    outcome: "Local stakeholders shape solutions and sustain change beyond one event.",
    body: "Mobilisation, behaviour change, and ownership so change is led by communities themselves.",
    focus: [
      "Community mobilisation",
      "Public awareness",
      "Social & behaviour change",
      "Community dialogue",
      "Volunteer engagement",
    ],
  },
  {
    Icon: Brain,
    title: "Mental Health Support",
    imageKey: "mentalHealth",
    category: "Health",
    tagline: "Safe spaces and psychosocial care",
    stat: "Peer support embedded",
    outcome:
      "Mental health conversations become safer, less stigmatized, and more connected to care.",
    body: "Psychosocial support, safe spaces, and referral pathways for young people facing mental health challenges.",
    focus: [
      "Peer counselling",
      "Safe spaces for young people",
      "Psychosocial first aid",
      "Referral pathways",
      "Stigma reduction",
    ],
  },
  {
    Icon: Shield,
    title: "GBV Prevention & Response",
    imageKey: "gbv",
    category: "Protection",
    tagline: "Building safer communities for everyone",
    stat: "Protection pathways strengthened",
    outcome: "Survivors and at-risk groups are connected to safer support and referral options.",
    body: "Survivor-centered prevention, support, and norms transformation.",
    focus: [
      "GBV prevention",
      "Survivor support & referral",
      "Community awareness",
      "Gender equality promotion",
      "Capacity building for service providers",
    ],
  },
  {
    Icon: GraduationCap,
    title: "Youth Empowerment",
    imageKey: "empowerment",
    category: "Youth",
    tagline: "Supporting the next generation",
    stat: "Sport and skills pathways",
    outcome: "Youth build belonging, discipline, confidence, and routes to opportunity.",
    body: "Information, support, and safe spaces that foster healthy growth and positive life outcomes.",
    focus: [
      "Adolescent health",
      "Life skills",
      "Education support",
      "Peer mentorship",
      "Safe spaces for young people",
    ],
  },
  {
    Icon: Megaphone,
    title: "Advocacy & Policy Influence",
    imageKey: "advocacy",
    category: "Advocacy",
    tagline: "Voice that moves systems",
    stat: "Partner-ready advocacy",
    outcome: "Community evidence is translated into policy dialogue and stakeholder action.",
    body: "Evidence-based advocacy and stakeholder engagement to shift policies and practices.",
    focus: [
      "Policy dialogues",
      "Stakeholder engagement",
      "Research & evidence",
      "Capacity strengthening",
      "Advocacy tools & materials",
    ],
  },
];
