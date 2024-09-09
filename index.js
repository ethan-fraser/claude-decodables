import dotenv from "dotenv";
dotenv.config();
import Anthropic from "@anthropic-ai/sdk";
import levelsData from "./data.json" assert { type: "json" };
import fs from "fs";

const anthropic = new Anthropic();

const decodables = [];

for (let i = 8; i <= 47; i++) {
  const levelData = levelsData[i.toString()];

  const msg = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1000,
    temperature: 0,
    system: `
Your job is to write decodable stories support skill consolidation for phonics and morphology.

You will take a specified level of a morphology and phonics scope and sequence and generate stories of varying complexity based on the input provided. The generated stories will adhere strictly to the phonemic and morphemic rules and spelling patterns, and word lists for that level
The level's data will be provided in json format as part of the task.

You may only draw from the following properties on the json: newCode, cumulativeCode, newMorphemes, cumulativeMorphemes, words, cumulativeWords.

The stories should be on the short side and stick AS STRICTLY as possible to the code/morphemes and words for that  level and preceding levels only, you may use words more than once and add words that match the spelling patterns specified in "cumulative code" and "new code" and "cumulative morphemes" and "new morphemes".

The story should not contain any special characters aside from punctuation, and any characters that conflict with JSON must be escaped.

You should ensure the text has a higher representation of the code/morphemes being practiced at that level because the point is to practice and rehearse this knowledge at each level. You may use nonsense words that use the phonic patterns up to and including that level for things like spellcasting sound effects etc.

As a general rule, for levels 1-6 you should only use VOWEL-CONSONANT (VC) words and CONSONANT-VOWEL-CONSONANT (CVC) words ONLY. I understand this will limit storytelling, so you may use high frequency words sparingly (eg. the, and, is, it, in, my, up, at, etc.) but the focus should be on the words from the word list provided.

From level 7+ you may create CVCC, CCVC, CCVCC words as well as using morphemes that have been introduced up to and including that level (eg. the plural s).

Any words that are not from the word set provided should be clearly identified.

Each level should also include a few simple comprehension questions that can be answered from the text and a very brief "blurb".

The structure of your response should be

{
  "level": <level number>,
  "pages": [
    <page 1>,
    <page 2>,
    <etc.>
  ],
  "title": <title for the generated story>,
  "blurb": <short summary of the generated story>,
  "questions": [
    <comprehension question 1>,
    <comprehension question 2>,
    <etc.>
  ]
}

Each page should be a string of text with one sentence. The title and blurb should be a string of text. Each question should be a string of text. Do not include any fields other than those specified above.

The stories should fit in with the setting of the world of Lexia:

World of Lexia - Background for Decodable Texts
Lexia is a world where magic and technology once clashed, creating a land full of tension and uncertainty. For many years, the people of Lexia had to choose between the old ways of magic or the new ways of machines, leading to endless strife. But everything changed when five special children, known as the first Spellcasters, discovered how to blend magic and technology together in harmony. This was called The Middle Way.
These Spellcasters became the first Wardens of Lexia, guiding the people and protecting the realms of Lexia. Each realm is unique, filled with wonders like snowy mountains, dense jungles, sandy deserts, and lush forests. These realms are overseen by the Wardens, who help young Spellcasters learn and grow. The Wardens also guard ancient books filled with powerful knowledge that shapes the world of Lexia.
Now, new generations of Spellcasters must train under these Wardens to master the Middle Way. Whether exploring Warden Snowdrift's icy Snow Realm or venturing through Warden Springtide's blooming Spring Forest Realm, your journey will be filled with challenges and rewards. As you collect, repair, and protect the books of Lexia, you will help maintain the balance between magic and technology, ensuring that Lexia remains a world of harmony for all.
`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify(levelData, null, 2),
          },
        ],
      },
    ],
  });
  const story = msg.content[0].text;
  try {
    const json = JSON.parse(story);
    console.log(json);
    decodables.push(json);
    fs.writeFileSync("decodables.json", JSON.stringify(decodables, null, 2));
  } catch (e) {
    console.error("Error parsing JSON", e);
  }
}
