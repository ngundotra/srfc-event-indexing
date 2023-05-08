# CPI Events

This spec is currently alpha and subject to change.

## Summary

A standard protocol to enable off-chain indexing of program state, without requiring program state layout on-chain. This protocol describes a method that allows program's to store information in CPI data to be safely read and interpreted by off-chain data providers.

## Motivation

A standard protocol for indexing program state is necessary to support a flourishing and competitive ecosystem of projects on Solana. As it stands today, the Solana ecosystem's innovation is bottlenecked by the lack of shared interpretability between programs. 

Developers that want to make their program's information readily available to blockchain developers are stuck between storing data in transaction logs, which are commonly truncated, or in on-chain accounts, often with no clear way of finding such account addresses. 

By putting together a specification for checks & required on-chain code necessary to store data in Cross Program Invocation instruction data, we hope to see more indie development of programs, and greater diversity of data subscribers.

## Why CPIs?

Cross-Program Invocations (CPIs) have a more explicit pricing curve, and are more commonly stored by RPC providers than full transaction logs. This makes CPIs a more attractive location for storing metadata related to program execution.

## Specification: CPI Events

Executing a transfer requires three things

<!-- GIve a short summary of the SRFC and why it is needed -->

**Implementation**: <!-- link to implementation/documentation/PoC -->