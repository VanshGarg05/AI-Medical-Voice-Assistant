import { openai } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI medical assistant helping users find suitable doctors from a predefined doctor list.

## Doctor Data:
${JSON.stringify(AIDoctorAgents)}

## Instructions:
- Read the user's provided notes/symptoms carefully.
- Analyze what type of doctor or specialization is relevant to these symptoms.
- Select relevant doctors from the provided list, ensuring alignment with their specialization and potential match to symptoms.
- Return ONLY a valid JSON array of matching doctors from the provided list.

## Output Format:
Return:
[
    {
        "id":<given id of the doctor>
        "image": "<image path>",
        "specialist": "<specialization>",
        "description": "<short reason for matching>",
        "voiceId":"<voice id given>"

    },
    ...
]
Return any Doctor if you couldn't suggest any return the first doctor always if you are unable to return any
Do not return any text outside of the JSON. Do not add commentary. If no doctor matches, return an empty JSON array [].
                    `.trim(),
        },
        {
          role: "user",
          content: `User notes/symptoms: ${notes}`,
        },
      ],
    });

    const rawResp = completion.choices[0].message;
    //@ts-ignore
    const resp = rawResp.content.trim().replace(/<answer>|<\/answer>/g, "");
    

    console.log(resp);
    const JsonResp = JSON.parse(resp);
    console.log('De rha hu');
    
    
    return NextResponse.json(JsonResp);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : error,
    });
  }
}
