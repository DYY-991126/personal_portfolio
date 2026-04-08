# Project 2 迁移清单

目标：基于真实 Wegic 前后端项目，在作品集项目中复现「生成前沟通 + 生成网站」这条核心链路。

范围约束：

- 只关注生成前沟通与生成网站
- 不处理生成后代码文件、Studio 工作记录、调试工具链等内容
- Prompt 以作品集项目当前版本为准，不以公司 Kimmy prompt 为主

## 一、生成前沟通

### 需要迁移的真实能力

- 输入框上方选项
- 内容结构卡
- 风格参考图
- 资料收集表单

### 对应真实前端来源

- `apps/builder/src/components/InputOptionSelector`
- `apps/builder/src/components/Markdown/MarkdownViewer/CustomTagCom/PageStructure`
- `apps/builder/src/components/Markdown/MarkdownViewer/CustomTagCom/ReferenceUI`
- `apps/builder/src/components/Markdown/MarkdownViewer/CustomTagCom/AssetCollectForm`

### 作品集项目目标

- 用统一的 tool-driven UI 方式复现这 4 类消息
- 保留真实产品里的关键交互体验
- 不继续走 custom tag 解析路线

## 二、生成网站

### 需要迁移的真实 skill

- `design/website`
- `design/hero-video`
- `design/launch-video`
- `design/image-enhancement`

### 作品集项目中的 skill 抽象

#### Scenario Skills

- `maps`
- `redesign`
- `clone`

#### Core / Support Skills

- `website_design`
- `image_generation`
- `video_generation`

### 关系定义

- `maps / redesign / clone` 是入口型场景 skill
- `website_design` 是核心生成 skill
- 正常纯文字建站请求，默认直接进入 `website_design`
- `maps / redesign / clone` 在收集足够上下文后 handoff 到 `website_design`
- `image_generation / video_generation` 由 `website_design` 按需调用

## 三、Tools

### 最终目标

- `firecrawl`
- `show_input_options`
- `design_content_structure`
- `show_style_references`
- `show_asset_collection_form`

### 说明

- `firecrawl` 是统一 research tool
- 4 个 UI tools 负责非正文 AI 消息
- Skill 决定何时调用 tool

## 四、Prompt

### 原则

- 以作品集项目当前 prompt 为基准
- 尽量保留原有业务判断与工作流
- 只补充 skill invocation rules

### 当前需要覆盖的规则

- `maps` 何时进入
- `redesign` 何时进入
- `clone` 何时进入
- `website_design` 何时作为默认主路径进入
- `image_generation / video_generation` 何时由 `website_design` 调用

## 五、实施顺序

1. 固定 prompt 与架构定义
2. 固定 skill / tool 清单
3. 对齐生成前沟通的 4 类 UI
4. 打通 `website_design` 主链路
5. 接入 `image_generation / video_generation`
6. 最后再替换 `firecrawl` 的底层真实实现

