# Style Guide

## Target Style
Write notes as concise review notes, not as a classroom record and not as a long lecture handout.

## Core Requirements
- Write in clean Chinese prose.
- Organize by knowledge point.
- Put noun-like knowledge-point titles before explanatory questions.
- Explain each point clearly but briefly.
- In `是什么`, define the object concretely enough that the reader knows exactly what it is.
- Prefer `知识点讲解 + 举例讲解`.
- Keep formulas, matrices, tables, and examples that aid understanding.
- Preserve source coverage before optimizing wording.

## Required Elements
Each finished note should contain most of these elements:
- noun-like knowledge-point heading
- `是什么`
- `是干嘛的 / 为什么重要`
- `这一讲里怎样用到它`
- `一个例子或应用`
- important formulas, matrix structures, or other structured facts when relevant
- a concrete definition in `是什么`, such as a formula, method flow, theorem claim, or model update structure

## Hard Structural Rule
Do not start a knowledge point with a problem-first heading such as:
- `为什么...`
- `怎么...`
- `如何...`

Instead:
- name the knowledge point first
- place those questions underneath it

## Definition Quality Rule
Do not let `是什么` collapse into vague motivation. The first subsection should answer the object itself. For example:
- formula or equation: write the formula and say what each symbol represents
- method: state the core steps or solving route
- model: give state variables, key parameters, and update rule
- theorem: state the condition and the main conclusion
- matrix tool: write the matrix relation and explain what it means

## Use Domain Knowledge Carefully
Use subject knowledge to improve explanation quality.
Do this by:
- clarifying what a term means
- explaining what a model is for
- explaining why a structure is written that way
- giving a compact application example

Do not do this by:
- replacing source details with vague summary
- introducing unrelated extra topics
- turning concise notes into long-form teaching materials by default

## Avoid
Avoid these wording patterns unless the user requests otherwise:
- `本课`
- `老师`
- `课堂`
- `录音`
- `实录`
- direct narration of what happened during teaching
- filler-heavy transcript residue
