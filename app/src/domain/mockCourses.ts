import { CourseDefinition } from "./courses"




/* -------------------------------------------------------------------------- */
/*                               MOCK COURSES                                 */
/* -------------------------------------------------------------------------- */

export const mockCourses: CourseDefinition[] = [
  {
    id: "solana-fundamentals",
    title: "Solana Fundamentals",
    description: "Learn how Solana works from accounts to transactions.",
    difficulty: "Beginner",
    lessonCount: 5,
    xpPerLesson: 25,
    trackId: "core",
    trackLevel: 1,
    lessons: [
      {
        id: 0,
        title: "What is Solana?",
        type: "content",
        xpReward: 25,
        content: `
Solana is a high-performance blockchain designed for scalability.

Key properties:
- Proof of History (PoH)
- Parallel execution
- Low transaction fees
- High throughput

Solana enables fast, scalable decentralized applications.
        `,
      },
      {
        id: 1,
        title: "Accounts Model",
        type: "content",
        xpReward: 25,
        content: `
Everything in Solana is an account.

Accounts:
- Store state
- Are owned by programs
- Have rent-exempt requirements

Programs modify account data through instructions.
        `,
      },
      {
        id: 2,
        title: "Transactions & Signers",
        type: "content",
        xpReward: 25,
        content: `
Transactions contain instructions.

Each transaction:
- Requires signers
- Executes atomically
- Pays fees

Signers authorize state changes.
        `,
      },
      {
        id: 3,
        title: "Write Your First Program",
        type: "challenge",
        xpReward: 40,
        content: `
Create a simple function that returns the string "Hello Solana".
        `,
        starterCode: `function greet() {
  // return "Hello Solana"
}`,
        challenge: {
            functionName: "greet",
            expectedReturn: "Hello Solana",
            },
      },
      {
        id: 4,
        title: "Deploy to Devnet",
        type: "challenge",
        xpReward: 40,
        content: `
Simulate deployment by returning true from the deploy() function.
        `,
        starterCode: `function deploy() {
  // return true
}`,
        challenge: {
                functionName: "deploy",
                expectedReturn: true,
                },
      },
    ],
  },
  {
    id: "anchor-mastery",
    title: "Anchor Mastery",
    description: "Build production-ready Solana programs using Anchor.",
    difficulty: "Intermediate",
    lessonCount: 6,
    xpPerLesson: 40,
    trackId: "core",
    trackLevel: 2,
    lessons: [
      {
        id: 0,
        title: "Anchor Project Structure",
        type: "content",
        xpReward: 40,
        content: `
An Anchor project contains:

- programs/
- tests/
- migrations/
- Anchor.toml

Anchor abstracts away boilerplate.
        `,
      },
      {
        id: 1,
        title: "PDAs Explained",
        type: "content",
        xpReward: 40,
        content: `
Program Derived Addresses (PDAs):

- Deterministic
- Off-curve
- Owned by programs

Used for secure program-controlled accounts.
        `,
      },
      {
        id: 2,
        title: "Account Constraints",
        type: "content",
        xpReward: 40,
        content: `
Anchor provides declarative account constraints.

Examples:
- has_one
- seeds
- payer
- mut

Constraints improve safety.
        `,
      },
      {
        id: 3,
        title: "Token-2022 Integration",
        type: "challenge",
        xpReward: 60,
        content: `
Simulate mint creation by returning the string "token-2022".
        `,
        starterCode: `function createMint() {
  // return "token-2022"
}`,
        challenge: {
  functionName: "createMint",
  expectedReturn: "token-2022",
},
      },
      {
        id: 4,
        title: "CPI Patterns",
        type: "challenge",
        xpReward: 60,
        content: `
Simulate a CPI call by returning the string "cpi-success".
        `,
        starterCode: `function cpi() {
  // return "cpi-success"
}`,
        challenge: {
  functionName: "cpi",
  expectedReturn: "cpi-success",
},
      },
      {
        id: 5,
        title: "Testing with Anchor",
        type: "challenge",
        xpReward: 60,
        content: `
Simulate passing tests by returning true.
        `,
        starterCode: `function runTests() {
  // return true
}`,
       challenge: {
  functionName: "runTests",
  expectedReturn: true,
},
      },
    ],
  },
]