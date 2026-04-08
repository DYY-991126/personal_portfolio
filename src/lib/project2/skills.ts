export type Project2SkillId =
  | "maps"
  | "redesign"
  | "clone"
  | "website_design"
  | "image_generation"
  | "video_generation";

export type Project2SkillKind = "scenario" | "core" | "support";

export type Project2SkillContract = {
  id: Project2SkillId;
  kind: Project2SkillKind;
  title: string;
  objective: string;
  handoffTo?: Project2SkillId[];
  invokesWhenNeeded?: Project2SkillId[];
};

export const PROJECT2_SKILLS: Record<Project2SkillId, Project2SkillContract> = {
  maps: {
    id: "maps",
    kind: "scenario",
    title: "Maps Skill",
    objective: "Understand a Google Maps business source and prepare enough context for website generation.",
    handoffTo: ["website_design"],
  },
  redesign: {
    id: "redesign",
    kind: "scenario",
    title: "Redesign Skill",
    objective: "Understand an existing website and translate it into a redesign-ready website direction.",
    handoffTo: ["website_design"],
  },
  clone: {
    id: "clone",
    kind: "scenario",
    title: "Clone Skill",
    objective: "Understand a reference website and extract what should be closely referenced before website generation.",
    handoffTo: ["website_design"],
  },
  website_design: {
    id: "website_design",
    kind: "core",
    title: "Website Design Skill",
    objective: "Turn collected context into a complete website generation direction and production plan.",
    invokesWhenNeeded: ["image_generation", "video_generation"],
  },
  image_generation: {
    id: "image_generation",
    kind: "support",
    title: "Image Generation Skill",
    objective: "Generate image-based visual outputs and supporting website assets when website design needs them.",
  },
  video_generation: {
    id: "video_generation",
    kind: "support",
    title: "Video Generation Skill",
    objective: "Generate hero or launch-related video assets when website design needs motion content.",
  },
};

export type SkillRoutingResult = {
  activeSkill: Project2SkillId;
  routeReason: string;
  nextSkill?: Project2SkillId;
};

export function inferScenarioSkill(params: {
  latestUserMessage?: string;
  linkType?: "google_maps" | "website" | "unknown";
}): SkillRoutingResult {
  const text = (params.latestUserMessage || "").toLowerCase();
  const { linkType } = params;

  const cloneHints = ["clone", "照着", "仿", "模仿", "类似", "参考这个", "复刻"];
  const redesignHints = ["redesign", "改版", "升级", "重做", "优化", "modernize", "refresh"];

  if (linkType === "google_maps") {
    return {
      activeSkill: "maps",
      routeReason: "The source is a Google Maps business link.",
      nextSkill: "website_design",
    };
  }

  if (cloneHints.some((hint) => text.includes(hint))) {
    return {
      activeSkill: "clone",
      routeReason: "The user intent is to closely reference or recreate an existing site.",
      nextSkill: "website_design",
    };
  }

  if (redesignHints.some((hint) => text.includes(hint))) {
    return {
      activeSkill: "redesign",
      routeReason: "The user intent is to improve or redesign an existing site.",
      nextSkill: "website_design",
    };
  }

  return {
    activeSkill: "website_design",
    routeReason: "This is the default main path for normal website generation conversations.",
  };
}

export function getSkillContract(skillId: Project2SkillId) {
  return PROJECT2_SKILLS[skillId];
}

