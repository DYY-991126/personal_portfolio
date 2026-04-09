"use client";

import Mermaid from "./Mermaid";

/** Website Design 主技能与子技能、联网能力关系示意 */
const PROJECT_4_SKILL_HIERARCHY_CHART = `flowchart TB
  subgraph BASE[基础建设]
    NET[联网搜索能力]
  end
  WD[Website Design 主技能]
  NET -.->|支撑设计调研| WD
  WD --> LV[launch-video]
  WD --> HV[hero-video]
  WD --> IE[image-enhancement]
  WD --> GL[gen-logo]
`;

export default function Project4WebsiteSkillHierarchyMermaid() {
  return <Mermaid chart={PROJECT_4_SKILL_HIERARCHY_CHART} />;
}
