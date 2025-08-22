---
layout: post
title: "Building on LLM Research: Smart Contract Security and Beyond"
date: 2025-08-22 10:00:00 +0000
categories: research llm
---

I've been thinking and building on large language model research for a few years now and wanted to write a short blog post on here about the current state of research, the limitations and my personal experiences after many experiments and many wasted tokens.

## What Have I Built?

Well mainly research artifacts that are of no interest to many barring a small group of smart contract security researchers and even then, these are not complete foundational systems but instead extensions on existing research. 

I started off with GPTLens ([arXiv:2310.01152](https://doi.org/10.48550/arXiv.2310.01152)) in mid 2023 which piqued my interest. Using LLMs to attempt to protect and analyze smart contracts was not a revolutionary idea. LLMs are capable of code analysis and should in theory have a large corpus of training material readily available. 

The underrated idea from this paper is drawn from another common concept in machine learning: generative adversarial networks. Using LLMs as agents, an early version of the currently very popular agentic research done by major labs such as OpenAI, Anthropic etc was a novel idea at the time and I delved further into the paper and found they were using models that were *fundamentally* unsuitable. 

Connoisseurs of machine learning will have read Sutton's highly regarded post on the nature of progress in this field (if you have not, take your time to read through [here](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)). So I implemented (through a few simple API calls) the first public reasoning model implementation of a multi-agent smart contract analysis system. When you put it like that, it sounds quite complex and overly fancy but in reality it was a few lines added into an existing pipeline.

## Results and Lessons Learned

The results nevertheless were interesting, benchmark scores on vulnerability assessments jumped 10%+ practically overnight. No such thing as a free lunch sure, as the token costs and therefore general program costs increased too but smart contract audits are not a field of speed and efficiency but rather accuracy and precision.

## The Most Interesting System

This brings us to my final system and the most interesting by far. It's quite a boring paper to read and largely incomprehensible to those without a computer science background or similar, but essentially a type system was created for type propagation to detect accounting bugs which lead to financial loss. The craziest part is all these type annotations were done manually and by hand, sometimes leading to type annotation files 100 lines long. 

Nobody at the time had (seemingly) thought to use the semantic comprehension ability of LLMs to do the grunt work of this task. So I implemented it in March of 2025 ([AutoScType](https://github.com/melvn/AutoScType)) and added reasoning model support of course for more accurate annotation quality. 

Interestingly the original authors of the paper in January of 2025 did submit a paper doing the same thing and more, with an enhanced hallucination detection system as well. The second paper was not published until June of 2025 in NeurIPS ([10.5555/3737916.3742174](https://dl.acm.org/doi/10.5555/3737916.3742174)). 

Both ideas are interesting real world extensions with practical and monetary gain using reasoning large language models to improve the world around us.