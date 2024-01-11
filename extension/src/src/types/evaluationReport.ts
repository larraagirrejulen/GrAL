import { ConformanceLevel, EarlOutcome, Evaluator, SuccessCriteriaName } from "./customTypes";



export interface EvaluationReport {
    auditSample: Criteria[];
    structuredSample: StructuredSample
    evaluationScope: EvaluationScope
    title: string
    assertors: {
        id: `_:${Evaluator}`,
        type: "earl:Assertor",
        'xmlns:name': Evaluator,
        description: string
      }[]
    // Define other properties of CurrentReport
}

export interface EvaluationScope {
    conformanceTarget: "wai:WCAG2A-Conformance" | "wai:WCAG2AA-Conformance" | "wai:WCAG2AAA-Conformance"
}
  
export interface Criteria {
    conformanceLevel: ConformanceLevel;
    hasPart: FoundCase[];
    result: Result;
    assertedBy?: `_:${Evaluator}`; // Define the actual type if needed
    mode?: "earl:automatic"; // Define the actual type if needed
    // Define other properties of Criteria
}
  
export interface Result {
    outcome: EarlOutcome;
    description: string;
    locationPointersGroup?: LocationPointer[];
}
  
export interface FoundCase {
    testcase: `earl:${SuccessCriteriaName}`;
    result: {
        outcome: EarlOutcome;
        locationPointersGroup: LocationPointer[];
        description: string;
    };
    assertedBy: Assertion[];
    subject: string
    // Define other properties of FoundCase
}
  
export interface Assertion {
    assertor: Evaluator
    description: string
    modifiedBy: string[]
    lastModifier: string
}
  
export interface LocationPointer {
    assertedBy: Evaluator[]
    "ptr:expression": string
    description: string
    // Define the properties of LocationPointer
}

export interface StructuredSample {
    webpage: WebPage[]
}

export interface WebPage{
    id: string
}