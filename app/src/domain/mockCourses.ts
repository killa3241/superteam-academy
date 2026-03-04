import { CourseDefinition } from "./courses"

/* -------------------------------------------------------------------------- */
/*                               MOCK COURSES                                 */
/* -------------------------------------------------------------------------- */

export const mockCourses: CourseDefinition[] = [
  /* -------------------------------------------------------------------------- */
  /*                              BEGINNER COURSE                               */
  /* -------------------------------------------------------------------------- */
  {
    id: "solana-fundamentals",
    title: "courses.solanaFundamentals.title",
    description: "courses.solanaFundamentals.description",
    difficulty: "Beginner",
    lessonCount: 6,
    xpPerLesson: 30,
    trackId: "core",
    trackLevel: 1,
    lessons: [
      {
        id: 0,
        title: "Introduction to Solana Architecture",
        type: "content",
        xpReward: 30,
        content: `
Solana is a high-performance Layer 1 blockchain optimized for speed and low fees.

Core innovations:
- Proof of History (PoH)
- Tower BFT
- Parallel execution
- Runtime-level optimizations

Solana enables scalable decentralized applications.
        `,
      },
      {
        id: 1,
        title: "The Solana Accounts Model",
        type: "content",
        xpReward: 30,
        content: `
Everything in Solana is an account.

Accounts:
- Store state
- Have an owner (program)
- Require rent exemption
- Contain lamports and data

Programs modify account state via instructions.
        `,
      },
      {
        id: 2,
        title: "Transactions and Instructions",
        type: "content",
        xpReward: 30,
        content: `
Transactions contain one or more instructions.

Each transaction:
- Requires valid signers
- Executes atomically
- Pays network fees

Signers authorize state transitions.
        `,
      },
      {
        id: 3,
        title: "Program Derived Addresses (PDAs)",
        type: "content",
        xpReward: 30,
        content: `
PDAs are deterministic addresses derived from seeds.

Characteristics:
- Off-curve
- Owned by programs
- Secure and predictable

Used for escrow, vaults, state accounts.
        `,
      },
      {
        id: 4,
        title: "Build a Simple Function",
        type: "challenge",
        xpReward: 40,
        content: `
Create a function that returns the string "Hello Solana".
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
        id: 5,
        title: "Simulate Deployment",
        type: "challenge",
        xpReward: 40,
        content: `
Simulate deployment by returning true.
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

  /* -------------------------------------------------------------------------- */
  /*                           INTERMEDIATE COURSE                              */
  /* -------------------------------------------------------------------------- */
  {
    id: "anchor-mastery",
    title: "courses.anchorMastery.title",
    description: "courses.anchorMastery.description",
    difficulty: "Intermediate",
    lessonCount: 6,
    xpPerLesson: 45,
    trackId: "core",
    trackLevel: 2,
    lessons: [
      {
        id: 0,
        title: "Anchor Project Architecture",
        type: "content",
        xpReward: 45,
        content: `
An Anchor project includes:

- programs/
- tests/
- migrations/
- Anchor.toml

Anchor abstracts boilerplate while preserving flexibility.
        `,
      },
      {
        id: 1,
        title: "Account Constraints Deep Dive",
        type: "content",
        xpReward: 45,
        content: `
Anchor provides declarative constraints:

- seeds
- bump
- has_one
- payer
- mut

Constraints improve security and readability.
        `,
      },
      {
        id: 2,
        title: "Cross Program Invocations (CPI)",
        type: "content",
        xpReward: 45,
        content: `
CPI allows programs to call other programs.

Important concepts:
- Program IDs
- Instruction contexts
- Signer seeds
        `,
      },
      {
        id: 3,
        title: "Token-2022 Integration",
        type: "challenge",
        xpReward: 60,
        content: `
Simulate mint creation by returning "token-2022".
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
        title: "Implement a CPI Call",
        type: "challenge",
        xpReward: 60,
        content: `
Return the string "cpi-success".
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
        title: "Testing Anchor Programs",
        type: "challenge",
        xpReward: 60,
        content: `
Return true to simulate successful test execution.
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

  /* -------------------------------------------------------------------------- */
  /*                               ADVANCED COURSE                              */
  /* -------------------------------------------------------------------------- */
  {
    id: "solana-protocol-engineering",
    title: "courses.protocolEngineering.title",
    description: "courses.protocolEngineering.description",
    difficulty: "Advanced",
    lessonCount: 6,
    xpPerLesson: 70,
    trackId: "core",
    trackLevel: 3,
    lessons: [
      {
        id: 0,
        title: "State Compression",
        type: "content",
        xpReward: 70,
        content: `
State compression reduces on-chain storage costs using Merkle trees.

Applications:
- NFTs
- Large datasets
- Scalable protocol design
        `,
      },
      {
        id: 1,
        title: "Optimizing Compute Units",
        type: "content",
        xpReward: 70,
        content: `
Efficient programs reduce compute usage.

Strategies:
- Avoid unnecessary deserialization
- Minimize account reads
- Optimize CPI calls
        `,
      },
      {
        id: 2,
        title: "Security Patterns in Solana",
        type: "content",
        xpReward: 70,
        content: `
Common vulnerabilities:
- Reinitialization attacks
- PDA misconfiguration
- Incorrect signer validation

Secure design prevents protocol exploits.
        `,
      },
      {
        id: 3,
        title: "Design a Vault System",
        type: "challenge",
        xpReward: 100,
        content: `
Return the string "vault-secured".
        `,
        starterCode: `function createVault() {
  // return "vault-secured"
}`,
        challenge: {
          functionName: "createVault",
          expectedReturn: "vault-secured",
        },
      },
      {
        id: 4,
        title: "Protocol Upgrade Simulation",
        type: "challenge",
        xpReward: 100,
        content: `
Return true to simulate protocol upgrade.
        `,
        starterCode: `function upgradeProtocol() {
  // return true
}`,
        challenge: {
          functionName: "upgradeProtocol",
          expectedReturn: true,
        },
      },
      {
        id: 5,
        title: "Production Readiness Checklist",
        type: "challenge",
        xpReward: 100,
        content: `
Return the string "production-ready".
        `,
        starterCode: `function audit() {
  // return "production-ready"
}`,
        challenge: {
          functionName: "audit",
          expectedReturn: "production-ready",
        },
      },
    ],
  },
]