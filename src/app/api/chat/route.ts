import { cookies } from "next/headers";
import { insforge } from "@/lib/insforge";
import { searchVault } from "@/lib/nia";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

const openai = new OpenAI();

const SYSTEM_PROMPT = `You are the Garden Guide, a friendly and knowledgeable assistant for Seedbase — a Stardew Valley-inspired project tracker where ideas grow from seeds into flowers.

Your role:
- Help users understand the project, find existing seeds (issues), and plant new ones
- Use the search_knowledge tool to find relevant context before answering questions about the project
- When a user describes an idea, bug, or problem, guide them toward planting a seed
- Use create_seed when you have enough info (title, description, priority, tags), or ask for missing details
- Speak in a warm, slightly whimsical garden tone — but stay concise and helpful
- When referencing existing seeds, mention their title and status

Available seed priorities: urgent, high, medium, low
Available seed tags: bug, feature, idea, research, decision
Available plant types: crystal_bloom, fire_lily, nebula_flower, frost_orchid, aurora_blossom, ember_dandelion, moon_petal, prism_flower, thunder_lotus, void_rose

Pick a plant_type that thematically matches the seed's nature (e.g. fire_lily for urgent bugs, crystal_bloom for polished features, nebula_flower for exploratory research).`;

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description:
        "Search the project's knowledge base (Nia vault) for existing seeds, docs, and context relevant to the user's query. Use this before answering questions about the project.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant knowledge",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_seed",
      description:
        "Create a new seed (issue/idea) in the project. Only call this when you have enough information from the conversation — at minimum a title and description. Ask the user for missing details before calling.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Short, descriptive title for the seed",
          },
          description: {
            type: "string",
            description: "Detailed description of the idea, bug, or task",
          },
          priority: {
            type: "string",
            enum: ["urgent", "high", "medium", "low"],
            description: "Priority level",
          },
          tags: {
            type: "array",
            items: {
              type: "string",
              enum: ["bug", "feature", "idea", "research", "decision"],
            },
            description: "Relevant tags",
          },
          plant_type: {
            type: "string",
            enum: [
              "crystal_bloom", "fire_lily", "nebula_flower", "frost_orchid",
              "aurora_blossom", "ember_dandelion", "moon_petal", "prism_flower",
              "thunder_lotus", "void_rose",
            ],
            description: "Plant type that thematically matches the seed",
          },
        },
        required: ["title", "description", "priority", "tags", "plant_type"],
      },
    },
  },
];

async function getAuthInfo() {
  const cookieStore = await cookies();
  const token = cookieStore.get("insforge-token")?.value;
  if (!token) return null;

  try {
    // Decode JWT directly to avoid HTTP call (avoids SSL issues in dev)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    if (!payload.sub) return null;
    insforge.setAccessToken(token);
    return { token, userId: payload.sub as string };
  } catch {
    return null;
  }
}

async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
  projectId: string,
  userId: string
): Promise<string> {
  if (name === "search_knowledge") {
    const query = args.query as string;

    // Get project vault ID
    const { data: project } = await insforge.database
      .from("projects")
      .select("nia_vault_id")
      .eq("id", projectId)
      .single();

    if (!project?.nia_vault_id) {
      // Fallback: search DB directly
      const { data: seeds } = await insforge.database
        .from("seeds")
        .select("id, title, description, status, priority, tags")
        .eq("project_id", projectId)
        .ilike("title", `%${query.split(/\s+/)[0]}%`)
        .limit(10);

      return JSON.stringify({
        source: "database",
        results: seeds ?? [],
      });
    }

    const { matches } = await searchVault(project.nia_vault_id, query, 10);

    // Also get matching seeds from DB for richer context
    const words = query.split(/\s+/).filter((w) => w.length > 3).slice(0, 3);
    const dbResults: unknown[] = [];
    for (const word of words) {
      const { data } = await insforge.database
        .from("seeds")
        .select("id, title, description, status, priority, tags")
        .eq("project_id", projectId)
        .ilike("title", `%${word}%`)
        .limit(5);
      if (data) dbResults.push(...data);
    }

    return JSON.stringify({
      source: "nia_vault",
      vault_matches: matches,
      seed_matches: dbResults,
    });
  }

  if (name === "create_seed") {
    const { data: project } = await insforge.database
      .from("projects")
      .select("id, team_id, nia_vault_id")
      .eq("id", projectId)
      .single();

    if (!project) return JSON.stringify({ error: "Project not found" });

    const { data, error } = await insforge.database
      .from("seeds")
      .insert({
        team_id: project.team_id,
        project_id: projectId,
        title: args.title as string,
        description: args.description as string,
        status: "seed",
        priority: args.priority as string,
        tags: args.tags as string[],
        plant_type: args.plant_type as string,
        created_by: userId,
        context_roots: [],
        attachments: [],
        blockers: [],
        related_issue_ids: [],
        is_revived: false,
        suggested_tickets: [],
      })
      .select()
      .single();

    if (error) return JSON.stringify({ error: error.message });

    return JSON.stringify({
      success: true,
      seed: {
        id: data.id,
        title: data.title,
        priority: data.priority,
        tags: data.tags,
        plant_type: data.plant_type,
        status: data.status,
      },
    });
  }

  return JSON.stringify({ error: "Unknown tool" });
}

export async function POST(request: Request) {
  const auth = await getAuthInfo();
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, projectId } = (await request.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
    projectId: string;
  };

  if (!projectId || !messages?.length) {
    return Response.json({ error: "Missing projectId or messages" }, { status: 400 });
  }

  // Build message history for OpenAI
  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Run completion with tool use loop
  let response = await openai.chat.completions.create({
    model: "gpt-5.5",
    messages: chatMessages,
    tools,
    stream: false, // First pass: check for tool calls
  });

  let choice = response.choices[0];

  // Handle tool calls (may need multiple rounds)
  while (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
    const toolMessages: ChatCompletionMessageParam[] = [
      ...chatMessages,
      choice.message,
    ];

    for (const toolCall of choice.message.tool_calls) {
      if (toolCall.type !== "function") continue;
      const fn = toolCall.function;
      const args = JSON.parse(fn.arguments);
      const result = await handleToolCall(
        fn.name,
        args,
        projectId,
        auth.userId
      );

      toolMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    response = await openai.chat.completions.create({
      model: "gpt-5.5",
      messages: toolMessages,
      tools,
      stream: false,
    });

    choice = response.choices[0];
    // Update chatMessages for potential next loop
    chatMessages.length = 0;
    chatMessages.push(...toolMessages);
  }

  // Now stream the final response
  const finalMessages: ChatCompletionMessageParam[] = [
    ...chatMessages,
    ...(choice.message ? [choice.message] : []),
  ];

  // If we already have a complete response from tool use, stream it manually
  if (choice.message?.content) {
    const content = choice.message.content;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send content in chunks for a streaming feel
        const words = content.split(" ");
        let chunk = "";
        for (let i = 0; i < words.length; i++) {
          chunk += (i > 0 ? " " : "") + words[i];
          if (chunk.length >= 20 || i === words.length - 1) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
            chunk = "";
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // Fallback: stream directly from OpenAI
  const streamResponse = await openai.chat.completions.create({
    model: "gpt-5.5",
    messages: finalMessages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
