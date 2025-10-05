// app/api/chat/route.ts
import OpenAI from "openai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = (body?.messages ?? []) as Array<{ role: "user" | "assistant" | "system"; content: string }>

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const system = {
      role: "system" as const,
      content:
        [
          "あなたは相談を丁寧に整理するアシスタントです。",
          "会話の最後に、ユーザーが掲示板に投稿したい“確定文”を、必ず《確定》と《/確定》で**1回だけ**囲んで出力してください。",
          "確定文の外ではこのタグを使わないこと。『確定』セクションは一つだけです。",
          "確定文は冗長にせず、投稿にそのまま使える1段落程度の自然な文章にしてください。",
        ].join(" "),
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [system, ...messages],
      temperature: 0.3,
    })

    const reply = completion.choices[0]?.message?.content ?? ""
    return Response.json({ reply })
  } catch (e: any) {
    console.error(e)
    return new Response(JSON.stringify({ error: "failed" }), { status: 500 })
  }
}
