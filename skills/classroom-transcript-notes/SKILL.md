---
name: classroom-transcript-notes
description: "Convert classroom audio transcripts, lecture transcriptions, pasted raw lecture text, or existing lesson-note drafts into concise Chinese study-note Markdown for this project. Use when Codex needs to: (1) rewrite 课堂录音转写文本 into publishable notes, (2) extract a complete set of 专业术语 and knowledge points from source material, (3) explain each knowledge point with a fixed structure of 是什么 / 是干嘛的 / 这一讲怎么用 / 例子, or (4) normalize lecture notes under Blog/archive/课内/ to the project's concise note format."
---

# Classroom Transcript Notes

## Overview
Use this skill to turn raw classroom transcript text into concise study notes for this project. Assume the default reader has only high-school-level math/science plus a little computer background.

Prioritize a `知识点讲解 + 举例讲解` result:
- Extract knowledge points first.
- Organize by knowledge point, not by speaking order.
- Put the noun-like knowledge-point title first.
- Only after the knowledge-point title, explain `是什么 / 是干嘛的 / 这一讲怎样用到它 / 一个例子或应用`.
- The `是什么` part must define the point concretely, not abstractly.
- If the point is a structured mathematical model, include its minimum complete mathematical structure in `是什么`.
- For equation-like knowledge points, include the general form or standard written form when possible.
- Keep the result compact and review-friendly.
- Explain necessary terms in place instead of assuming advanced prerequisites.
- Preserve structured source content when it is itself a knowledge point.

Read `references/style-guide.md` first for writing rules. Read `references/workflow.md` for the processing sequence. Read `references/quality-checklist.md` before finalizing.

## Core Principle
Follow this principle for every note:

1. Extract as complete a list of professional terms and knowledge points as possible from the source.
2. Turn those terms into noun-like knowledge-point headings first.
3. Only then fill each heading with the fixed four-part explanation.
4. In `是什么`, define the object concretely: if it is a formula or equation, write its general form or standard expression; if it is a method, state the basic flow; if it is a model, give variables and update rule; if it is a theorem, state the key claim.
5. Never let a `为什么...` or `怎么...` question become the first entry point of a knowledge point.


The source defines coverage. Codex is responsible for explanation quality and structure. By default, do not assume the reader already knows linear algebra, probability, architecture, graphics, or machine learning prerequisites.

## Workflow
Follow this sequence:

1. Read the transcript or raw note text completely.
2. Extract a complete knowledge-point list before writing prose.
3. Convert the list into noun-like headings.
4. Mark named models, formulas, matrices, methods, and examples that must stay visible.
5. Group scattered transcript fragments under the correct knowledge-point heading.
6. Rewrite each knowledge point using a fixed pattern: `是什么 / 是干嘛的或为什么重要 / 这一讲里怎样用到它 / 一个例子或应用`.
7. Make the `是什么` subsection concrete enough that a reader can know what object is being discussed without reading later subsections.
8. Use domain understanding to clarify the point, but do not expand it into a long lecture handout.
9. When a term has obvious prerequisite burden, explain it in place with the minimum necessary intuition.
10. Preserve structured content explicitly when it is itself a knowledge point, such as matrix forms, recurrence relations, formulas, or algorithm steps.
11. Remove classroom-language residue such as teacher references, fillers, and timeline narration.
12. Stop and mark the file as blocked if the source transcript is empty or missing. Do not invent course content.

## Output Shape
Use this output style by default:

- Title: `课程名 - 第X课[:主题]`
- Main sections: concept groups
- Subsections: noun-like knowledge-point titles
- Each knowledge point: fixed four-part explanation in the order `是什么 -> 是干嘛的 / 为什么重要 -> 这一讲里怎样用到它 -> 一个例子或应用`
- Ending: one compact summary section if helpful

## Hard Rules
Apply these defaults unless the user overrides them explicitly:

- Write in Chinese.
- Default to concise study-note style.
- Do not require a 1500-character minimum by default.
- Favor completeness plus brevity over long-form expansion.
- Default to a reader with high-school-level math and only a little computer background.
- Use the source transcript as the coverage boundary.
- Use domain knowledge as an explanation enhancer, not as an excuse to add unrelated material.
- Avoid classroom-record wording such as `本课`、`老师`、`课堂`、`录音`、`实录`.
- Do not use `为什么...` or `怎么...` as the first heading of a knowledge point.
- A knowledge point must appear as a noun-like title before any explanatory question appears under it.
- The `是什么` subsection must concretely define the object itself, not just describe why it matters.
- For equations, formulas, recurrence relations, and matrix models, prefer the minimum complete mathematical expression over purpose-only wording.
- Use `$...$` for inline math and `$$...$$` for display math; do not use backticks to fake math rendering.
- Do not output raw transcript cleanup with only light polishing.
- Do not preserve obvious spoken-language repetition.

## Failure Modes
Handle these cases explicitly:

- Empty transcript: do not fabricate content; report the file as waiting for source material.
- Extremely noisy transcript: extract the stable knowledge skeleton first, then rewrite.
- Mixed logistics and content: keep only the logistics that materially affect studying; drop the rest.
- Existing note already matches the target style: make only minimal edits.
- Structured source detail missing in the rewrite: restore it explicitly instead of replacing it with prose summary.
- Problem-first heading detected: rewrite the heading into a noun-like knowledge point, then place the question under it.

## Resources
Use these reference files as needed:

- `references/style-guide.md`
- `references/workflow.md`
- `references/quality-checklist.md`
