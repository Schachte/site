---
title: 'x86 Hacking For Programmers'
date: 'Oct 16 2022'
tags: algorithms, recursion
mode: draft
---

## Background

Ever wonder what happens when you type in a snippet of code like `print "hello world"` or `const res = (() => 2+2)`? Typically, after we write programs in a higher-level language like `Java`, `Go`, `C` or `Python`, it gets compiled down into a form of `assembly language`. There are many exceptions to this as languages like `Java` have an intermediate bytecode that gets generated during compilation and executed using the `JVM`, but the principle is the same.

Because computers are "dumb" in the sense that they only carry out exactly what you tell it to. It's best to think of computer operations as series of arithmetic instructions. These instructions could be things like `add`, `subtract`, `conditional branching`, `looping`, etc. As you'll see in this series, these concetps aren't too different that what you'd write in something like Java or Go.

In order to tell a machine to `add` two numbers together, you may have a snippet of assembly that looks like `add eax, ebx`. This simple instruction is saying to take the binary data from the `eax` register and add it into the binary value of the `ebx` register and keep the result stored in the `ebx` register. Don't worry if this is confusing at the start, we will get a lot more practice and experience with these things shortly. 

Before we dive in, it's important to keep in mind that assembly is _not_ hard. The language is designed to be simple, logical and to the point. We have instructions that map directly to the hardware with no additional surprises. In this article we will cover the following:

- computer architecture
- math for systems engineers
- memory registers
- assembly instructions
- building a hello world program
- **bonus**
	- debugging in GDB
	- help, I'm on an M1/arm-based machine!


## Computer architecture primer 

## Registers

## Instructions

## HelloWorld.asm

