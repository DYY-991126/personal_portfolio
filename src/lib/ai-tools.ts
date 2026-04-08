import { PROJECTS } from "@/app/data";

// ── Frontend action types ──

export type AIAction =
  | { type: "navigate_to_project"; projectId: string }
  | { type: "navigate_home" }
  | { type: "show_project_index"; projectId?: string };

export interface ChatAPIResponse {
  message: string;
  actions: AIAction[];
}

// ── Screen states that drive dynamic tool provisioning ──

export type ScreenState = "menu" | "project_list" | "project_detail";

// ── Individual tool definitions ──

const TOOL_NAVIGATE_TO_PROJECT = {
  type: "function" as const,
  function: {
    name: "navigate_to_project",
    description:
      "导航到某个项目的详情页。当用户明确想进入某个具体项目时调用。",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          enum: PROJECTS.map((p) => p.id),
          description: "项目 ID，如 'project-1'",
        },
      },
      required: ["projectId"],
    },
  },
};

const TOOL_NAVIGATE_HOME = {
  type: "function" as const,
  function: {
    name: "navigate_home",
    description: "导航回首页。",
    parameters: { type: "object", properties: {}, required: [] },
  },
};

const TOOL_READ_PROJECT_CASE = {
  type: "function" as const,
  function: {
    name: "read_project_case",
    description:
      "按需读取本站某个作品集项目对应的 MDX 案例正文（已剥离大部分 React/MDX 组件标签）。当用户追问某项目的背景、方法、数据、章节细节，而仅凭简历与项目一览无法准确回答时调用；可对不同 projectId 多次调用。若用户只是想打开网页浏览，应使用 navigate_to_project。",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          enum: PROJECTS.map((p) => p.id),
          description: "项目 ID，例如 project-2",
        },
      },
      required: ["projectId"],
    },
  },
};

const TOOL_SHOW_PROJECT_INDEX = {
  type: "function" as const,
  function: {
    name: "show_project_index",
    description:
      "打开项目的 Index 3D 项目浏览层。当用户表达想查看过往项目、浏览其它项目、看看还有哪些项目、打开 index 时调用。如果没有指定具体项目，可使用默认项目。",
    parameters: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          enum: PROJECTS.map((p) => p.id),
          description: "可选。要打开其 Index 的项目 ID；未提供时使用默认项目。",
        },
      },
      required: [],
    },
  },
};

// ── Dynamic tool provisioning: different tools for different screen states ──

export function getToolsForScreen(screenState: ScreenState) {
  switch (screenState) {
    case "menu":
      return [TOOL_READ_PROJECT_CASE, TOOL_SHOW_PROJECT_INDEX, TOOL_NAVIGATE_HOME];
    case "project_list":
      return [TOOL_READ_PROJECT_CASE, TOOL_NAVIGATE_TO_PROJECT, TOOL_NAVIGATE_HOME];
    case "project_detail":
      return [TOOL_READ_PROJECT_CASE, TOOL_NAVIGATE_TO_PROJECT, TOOL_NAVIGATE_HOME, TOOL_SHOW_PROJECT_INDEX];
  }
}

// ── Parse tool_calls → typed AIActions ──

export function parseToolCalls(
  toolCalls: Array<{ id: string; function: { name: string; arguments: string } }>
): AIAction[] {
  return toolCalls
    .map((tc) => {
      try {
        const args = JSON.parse(tc.function.arguments);
        switch (tc.function.name) {
          case "navigate_to_project": {
            const project = PROJECTS.find((p) => p.id === args.projectId);
            return project
              ? { type: "navigate_to_project" as const, projectId: args.projectId }
              : null;
          }
          case "navigate_home":
            return { type: "navigate_home" as const };
          case "show_project_index":
            return PROJECTS.find((p) => p.id === args.projectId) || args.projectId === undefined
              ? { type: "show_project_index" as const, projectId: args.projectId }
              : null;
          case "read_project_case":
            return null;
          default:
            return null;
        }
      } catch {
        return null;
      }
    })
    .filter((a): a is AIAction => a !== null);
}

// ── Build tool result messages for the follow-up LLM call ──

export function buildToolResultMessages(
  toolCalls: Array<{ id: string; function: { name: string; arguments: string } }>,
  options?: { readProjectCase?: (projectId: string) => string }
) {
  return toolCalls.map((tc) => {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
    } catch {
      return { role: "tool" as const, tool_call_id: tc.id, content: "工具参数解析失败。" };
    }

    if (tc.function.name === "read_project_case" && options?.readProjectCase) {
      const projectId = typeof args.projectId === "string" ? args.projectId : "";
      const content = options.readProjectCase(projectId);
      return { role: "tool" as const, tool_call_id: tc.id, content };
    }

    let content = "操作已执行。";

    if (tc.function.name === "navigate_to_project") {
      const project = PROJECTS.find((p) => p.id === args.projectId);
      if (project) content = `已导航到项目「${project.title}」详情页。`;
    } else if (tc.function.name === "navigate_home") {
      content = "已导航回首页。";
    } else if (tc.function.name === "show_project_index") {
      const project = PROJECTS.find((p) => p.id === args.projectId);
      content = project
        ? `已打开「${project.title}」的 Index 项目浏览层。`
        : "已打开过往项目的 Index 项目浏览层。";
    } else if (tc.function.name === "read_project_case") {
      content = "read_project_case 未配置服务端读取器。";
    }

    return { role: "tool" as const, tool_call_id: tc.id, content };
  });
}
