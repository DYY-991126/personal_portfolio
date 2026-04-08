export type Project2UIToolCall =
  | {
      type: "show_input_options";
      payload: {
        question: string;
        expandedQuestion?: string;
        options: Array<{
          label: string;
          value?: string;
        }>;
      };
    }
  | {
      type: "firecrawl";
      payload: {
        url: string;
        intent?: string;
        suggestedSkill?: string;
        nextSkill?: string;
        suggestedSkillDescription?: string;
        title?: string;
        description?: string;
        markdownExcerpt?: string;
        placeProfile?: {
          name?: string;
          address?: string;
          phone?: string;
          rating?: number;
          totalReviews?: number;
          website?: string;
          type?: string;
          description?: string;
          priceLevel?: string;
          openState?: string;
          highlights?: string[];
          offerings?: string[];
          photosCount?: number;
        };
        summary: string;
        keyFacts: string[];
        suggestedActions: string[];
      };
    }
  | {
      type: "design_content_structure";
      payload: {
        siteName?: string;
        pages: Array<{
          id: string;
          name: string;
          description?: string;
          modules: Array<{
            id: string;
            name: string;
            purpose?: string;
            assets?: Array<{
              type: "image" | "text" | "video" | "audio" | "link";
              description: string;
              count: number;
              required: boolean;
              status: "missing" | "collected" | "partial";
            }>;
          }>;
        }>;
      };
    }
  | {
      type: "show_style_references";
      payload: {
        title?: string;
        referenceImages: Array<{
          id: string;
          title: string;
          description?: string;
          imageUrl?: string;
          accent?: string;
        }>;
      };
    }
  | {
      type: "show_asset_collection_form";
      payload: {
        title?: string;
        submitLabel?: string;
        skipLabel?: string;
        items: Array<{
          id: string;
          name: string;
          description: string;
          type: "text" | "file";
          placeholder?: string;
          required?: boolean;
          accept?: string;
        }>;
      };
    }
  | {
      type: "website_ready_summary";
      payload: {
        businessName: string;
        businessDescription: string;
        visitorBenefits: string[];
      };
    }
  | {
      type: "generation_execution_plan";
      payload: {
        skill: string;
        title: string;
        objective: string;
        status: string;
        sourceSkillPath?: string;
        skillMeta?: {
          name: string;
          description: string;
          filePath: string;
        };
        recommendedNextSkills: string[];
        outputs: string[];
        promptHints: string[];
      };
    }
  | {
      type: "generation_result";
      payload: {
        skill: string;
        title: string;
        summary: string;
        format: "website_brief" | "image" | "video";
        websiteBrief?: {
          projectSummary: string;
          pages: string[];
          styleDirection: string;
          mediaPlan: string[];
          buildPrompt: string;
        };
        imageUrls?: string[];
        videoUrl?: string;
      };
    };
