/**
 * Vote Flash Report Generator
 *
 * A reusable TypeScript module for generating Vote Flash Reports using jsPDF
 * Usage: import { generateVoteFlashReport, VoteFlashReportGenerator } from './voteFlashReportGenerator'
 */

import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

// Extend jsPDF with lastAutoTable property
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

/**
 * Configuration options for the report
 */
export interface VoteFlashReportConfig {
    voteCode: string;
    voteCodeDetail: string;
    voteName: string;
    annualPeriod: string;
    quarterlyPeriod: string;
}

/**
 * Data structure for scorecard table
 */
export interface ScorecardData {
    programCode: string;
    programmeName: string;
    absorptionRate: number;
    outputPerformance: number;
    outcomePerformance: number;
    compositeScore: number;
}

/**
 * Data structure for budget performance
 */
export interface BudgetPerformanceData {
    code: string;
    programmeName: string;
    approvedBudget: number;
    release: number;
    spent: number;
    percentRelease: number;
    percentReleaseSpent: number;
}

/**
 * Data structure for indicator performance
 */
export interface IndicatorPerformanceData {
    code: string;
    programmeName: string;
    numberOfIndicators: number;
    achieved: number;
    moderatelyAchieved: number;
    notAchieved: number;
    noData: number;
    percentAchieved: number;
    percentModerate: number;
    percentNotAchieved: number;
    percentNoData: number;
}

/**
 * Data structure for outcome performance
 */
export interface OutcomePerformanceData {
    code: string;
    programmeName: string;
    outcome: string;
    numberOfIndicators: number;
    achieved: number;
    moderatelyAchieved: number;
    notAchieved: number;
    noData: number;
    percentAchieved: number;
    percentModerate: number;
    percentNotAchieved: number;
    percentNoData: number;
}

/**
 * Data structure for detailed outcome
 */
export interface DetailedOutcomeData {
    outcome: string;
    indicator: string;
    baseline: string;
    target: string;
    actual: string;
    percentAchieved: string;
    explanation: string;
}

/**
 * Data structure for PIAP actions
 */
export interface PIAPActionData {
    action: string;
    budgetPlanned: string;
    budgetApproved: string;
    budgetReleased: string;
    budgetSpent: string;
    percentSpent: string;
    explanation: string;
}

/**
 * Complete report data structure
 */
export interface VoteFlashReportData {
    scorecards: ScorecardData[];
    budgetPerformance: BudgetPerformanceData[];
    indicatorPerformance: IndicatorPerformanceData[];
    outcomePerformance: OutcomePerformanceData[];
    outputPerformance: OutcomePerformanceData[];
    detailedOutcomes: DetailedOutcomeData[];
    detailedIntermediateOutcomes: DetailedOutcomeData[];
    detailedOutputs: DetailedOutcomeData[];
    piapActions: PIAPActionData[];
}

/**
 * Vote Flash Report Generator Class
 */
export class VoteFlashReportGenerator {
    private doc: jsPDFWithAutoTable;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number = 40;
    private yPos: number;
    private config: VoteFlashReportConfig;

    constructor(config: VoteFlashReportConfig) {
        this.doc = new jsPDF("p", "pt", "a4") as jsPDFWithAutoTable;
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.yPos = this.margin;
        this.config = config;
    }

    /**
     * Check if a new page is needed
     */
    private checkPageBreak(requiredSpace: number): boolean {
        if (this.yPos + requiredSpace > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.yPos = this.margin;
            return true;
        }
        return false;
    }

    /**
     * Add main title
     */
    private addMainTitle(): void {
        this.doc.setFontSize(14);
        this.doc.setFont("helvetica", "bold");
        this.doc.text("VOTE FLASH REPORT", this.pageWidth / 2, this.yPos, {
            align: "center",
        });
        this.yPos += 30;
    }

    /**
     * Add vote information
     */
    private addVoteInfo(): void {
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "bold");
        const voteText = `Vote ${this.config.voteCode} (${this.config.voteCodeDetail}) : (${this.config.voteName})`;
        this.doc.text(voteText, this.margin, this.yPos);
        this.yPos += 35;
    }

    /**
     * Add section header
     */
    private addSectionHeader(text: string): void {
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(text, this.margin, this.yPos);
        this.yPos += 25;
    }

    /**
     * Add subsection header
     */
    private addSubsectionHeader(text: string): void {
        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(text, this.margin, this.yPos);
        this.yPos += 20;
    }

    /**
     * Add period text
     */
    private addPeriod(period: string): void {
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(`Period: ${period}`, this.margin, this.yPos);
        this.yPos += 25;
    }

    /**
     * Add legend table
     */
    private addLegend(): void {
        const legendData = [
            [
                "A - Achieved (>= 100%)",
                "M - Moderately achieved (75-99%)",
                "N - Not achieved (< 75%)",
                "ND - No Data",
            ],
        ];

        autoTable(this.doc, {
            startY: this.yPos,
            head: [],
            body: legendData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 9,
                cellPadding: 8,
                fontStyle: "bold",
            },
            columnStyles: {
                0: { cellWidth: (this.pageWidth - 2 * this.margin) / 4 },
                1: { cellWidth: (this.pageWidth - 2 * this.margin) / 4 },
                2: { cellWidth: (this.pageWidth - 2 * this.margin) / 4 },
                3: { cellWidth: (this.pageWidth - 2 * this.margin) / 4 },
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 25;
    }

    /**
     * Add scorecard table
     */
    private addScorecardTable(data: ScorecardData[]): void {
        const headers = [
            [
                "Prog. Code",
                "NDP-IV Programme",
                "Absorption Rate (%)",
                "Output Performance (%)",
                "Outcome Performance (%)",
                "Composite Score (%)",
            ],
        ];
        const bodyData = data.map((item) => [
            item.programCode,
            item.programmeName,
            item.absorptionRate.toString(),
            item.outputPerformance.toString(),
            item.outcomePerformance.toString(),
            item.compositeScore.toString(),
        ]);

        autoTable(this.doc, {
            startY: this.yPos,
            head: headers,
            body: bodyData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 9,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: "bold",
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 30;
    }

    /**
     * Add budget performance table
     */
    private addBudgetPerformanceTable(data: BudgetPerformanceData[]): void {
        const headers = [
            [
                "Code",
                "NDP-IV Programme",
                "Approved Budget (Ugx Bn)",
                "Release (Ugx Bn)",
                "Spent (Ugx Bn)",
                "% Release",
                "% Release Spent",
            ],
        ];
        const bodyData = data.map((item) => [
            item.code,
            item.programmeName,
            item.approvedBudget.toFixed(1),
            item.release.toFixed(1),
            item.spent.toFixed(1),
            item.percentRelease.toFixed(1),
            item.percentReleaseSpent.toFixed(1),
        ]);

        autoTable(this.doc, {
            startY: this.yPos,
            head: headers,
            body: bodyData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 9,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: "bold",
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 30;
    }

    /**
     * Add indicator performance table
     */
    private addIndicatorPerformanceTable(
        data: IndicatorPerformanceData[],
    ): void {
        const headers = [
            [
                "Code",
                "NDP-IV Programme",
                "No. of indicators",
                "A",
                "M",
                "N",
                "ND",
                "%A",
                "%M",
                "%N",
                "%ND",
            ],
        ];
        const bodyData = data.map((item) => [
            item.code,
            item.programmeName,
            item.numberOfIndicators.toString(),
            item.achieved.toString(),
            item.moderatelyAchieved.toString(),
            item.notAchieved.toString(),
            item.noData.toString(),
            item.percentAchieved.toFixed(0),
            item.percentModerate.toFixed(0),
            item.percentNotAchieved.toFixed(0),
            item.percentNoData.toFixed(0),
        ]);

        autoTable(this.doc, {
            startY: this.yPos,
            head: headers,
            body: bodyData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 8,
                cellPadding: 4,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: "bold",
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 30;
    }

    /**
     * Add outcome performance table
     */
    private addOutcomePerformanceTable(data: OutcomePerformanceData[]): void {
        const headers = [
            [
                "Code",
                "NDP-IV Programme",
                "Outcome",
                "No. of indicators",
                "A",
                "M",
                "N",
                "ND",
                "%A",
                "%M",
                "%N",
                "%ND",
            ],
        ];
        const bodyData = data.map((item) => [
            item.code,
            item.programmeName,
            item.outcome,
            item.numberOfIndicators.toString(),
            item.achieved.toString(),
            item.moderatelyAchieved.toString(),
            item.notAchieved.toString(),
            item.noData.toString(),
            item.percentAchieved.toFixed(0),
            item.percentModerate.toFixed(0),
            item.percentNotAchieved.toFixed(0),
            item.percentNoData.toFixed(0),
        ]);

        autoTable(this.doc, {
            startY: this.yPos,
            head: headers,
            body: bodyData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 8,
                cellPadding: 4,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: "bold",
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 30;
    }

    /**
     * Add detailed outcome table
     */
    private addDetailedOutcomeTable(data: DetailedOutcomeData[]): void {
        const headers = [
            [
                "Outcome",
                "Outcome Indicator",
                "Baseline (2023/24)",
                "Target",
                "Actual",
                "% of Target Achieved",
                "Explanation for status",
            ],
        ];
        const bodyData = data.map((item) => [
            item.outcome,
            item.indicator,
            item.baseline,
            item.target,
            item.actual,
            item.percentAchieved,
            item.explanation,
        ]);

        autoTable(this.doc, {
            startY: this.yPos,
            head: headers,
            body: bodyData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 8,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: "bold",
            },
            columnStyles: {
                6: { cellWidth: 120 },
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 30;
    }

    /**
     * Add PIAP actions table
     */
    private addPIAPActionsTable(data: PIAPActionData[]): void {
        const headers = [
            [
                "PIAP Action",
                "Budget Planned 2025/26",
                "Budget Approved 2025/26",
                "Budget Released",
                "Budget Spent",
                "% of Release Spent",
                "Explanation",
            ],
        ];
        const bodyData = data.map((item) => [
            item.action,
            item.budgetPlanned,
            item.budgetApproved,
            item.budgetReleased,
            item.budgetSpent,
            item.percentSpent,
            item.explanation,
        ]);

        autoTable(this.doc, {
            startY: this.yPos,
            head: headers,
            body: bodyData,
            theme: "grid",
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 8,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: "bold",
            },
            columnStyles: {
                6: { cellWidth: 120 },
            },
        });

        this.yPos = this.doc.lastAutoTable.finalY + 30;
    }

    /**
     * Add page numbers to all pages
     */
    private addPageNumbers(): void {
        const pageCount = this.doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(9);
            this.doc.setFont("helvetica", "normal");
            this.doc.text(
                `Page ${i} of ${pageCount}`,
                this.pageWidth - this.margin - 40,
                this.pageHeight - 20,
            );
        }
    }

    /**
     * Generate the complete report
     */
    public generate(data: VoteFlashReportData): jsPDF {
        // Header
        this.addMainTitle();
        this.addVoteInfo();

        // SECTION 1.0
        this.addSectionHeader("SECTION 1.0\tSUMMARY HIGHLIGHTS OF PERFORMANCE");

        // 1.1 Performance Scorecards
        this.addSubsectionHeader("1.1 Performance Scorecards");

        // 1.1.1 Overall Scorecard
        this.addSubsectionHeader("1.1.1 Overall Scorecard");
        this.addPeriod(this.config.annualPeriod);
        this.addLegend();
        this.checkPageBreak(100);
        this.addScorecardTable(data.scorecards);

        // 1.1.2 Budget Performance Scorecard
        this.checkPageBreak(100);
        this.addSubsectionHeader("1.1.2 Budget Performance Scorecard");
        this.addPeriod(this.config.quarterlyPeriod);
        this.addBudgetPerformanceTable(data.budgetPerformance);

        // 1.2 Summary Performance
        this.checkPageBreak(100);
        this.addSubsectionHeader("1.2 Summary Performance");

        // 1.2.1 Indicator Performance by Programme
        this.addSubsectionHeader("1.2.1 Indicator Performance by Programme");
        this.addPeriod(this.config.annualPeriod);
        this.addIndicatorPerformanceTable(data.indicatorPerformance);

        // 1.2.2 Outcome Performance
        this.checkPageBreak(100);
        this.addSubsectionHeader("1.2.2 Outcome Performance");
        this.addPeriod(this.config.annualPeriod);
        this.addOutcomePerformanceTable(data.outcomePerformance);

        // 1.2.3 Output Performance
        this.checkPageBreak(100);
        this.addSubsectionHeader("1.2.3 Output Performance");
        this.addPeriod(this.config.quarterlyPeriod);
        this.addOutcomePerformanceTable(data.outputPerformance);

        // 1.2.4 Actions Budget Performance
        this.checkPageBreak(100);
        this.addSubsectionHeader("1.2.4 Actions Budget Performance");
        this.addPeriod(this.config.quarterlyPeriod);

        this.doc.setFontSize(12);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(
            "BP = Budget Planned|BA = Budget Approved|BR = Budget Released|BS = Budget Spent",
            this.margin,
            this.yPos,
        );
        this.yPos += 35;

        // SECTION 2.0
        this.doc.addPage();
        this.yPos = this.margin;
        this.addSectionHeader("SECTION 2.0\tDETAILED PERFORMANCE");

        // 2.1 Detailed Outcome Performance
        this.addSubsectionHeader("2.1 Detailed Outcome Performance");
        this.addPeriod(this.config.quarterlyPeriod);
        this.addDetailedOutcomeTable(data.detailedOutcomes);

        // 2.2 Detailed Intermediate Outcome Performance
        this.checkPageBreak(200);
        this.addSubsectionHeader(
            "2.2 Detailed Intermediate Outcome Performance",
        );
        this.addPeriod(this.config.quarterlyPeriod);
        this.addDetailedOutcomeTable(data.detailedIntermediateOutcomes);

        // 2.3 Detailed Output Performance
        this.checkPageBreak(200);
        this.addSubsectionHeader("2.3 Detailed Output Performance");
        this.addPeriod(this.config.quarterlyPeriod);
        this.addDetailedOutcomeTable(data.detailedOutputs);

        // 2.4 Detailed PIAP Actions Budget Performance
        this.checkPageBreak(200);
        this.addSubsectionHeader(
            "2.4 Detailed PIAP Actions Budget Performance",
        );
        this.addPeriod(this.config.quarterlyPeriod);
        this.addPIAPActionsTable(data.piapActions);

        // Add page numbers
        this.addPageNumbers();

        return this.doc;
    }

    /**
     * Save the PDF
     */
    public save(filename?: string): void {
        const name =
            filename || `Vote_Flash_Report_${this.config.voteCode}.pdf`;
        this.doc.save(name);
    }
}

/**
 * Convenience function to generate a report
 */
export function generateVoteFlashReport(
    config: VoteFlashReportConfig,
    data: VoteFlashReportData,
    filename?: string,
): jsPDF {
    const generator = new VoteFlashReportGenerator(config);
    const doc = generator.generate(data);

    if (filename) {
        generator.save(filename);
    }
    console.log(doc);

    return doc;
}

/**
 * Example usage data
 */
export const exampleData: VoteFlashReportData = {
    scorecards: [
        {
            programCode: "P01",
            programmeName: "Programme 1",
            absorptionRate: 85,
            outputPerformance: 90,
            outcomePerformance: 88,
            compositeScore: 87.7,
        },
        {
            programCode: "P02",
            programmeName: "Programme 2",
            absorptionRate: 78,
            outputPerformance: 82,
            outcomePerformance: 80,
            compositeScore: 80.0,
        },
    ],
    budgetPerformance: [
        {
            code: "P01",
            programmeName: "Programme 1",
            approvedBudget: 100.5,
            release: 90.0,
            spent: 85.2,
            percentRelease: 89.6,
            percentReleaseSpent: 94.7,
        },
        {
            code: "P02",
            programmeName: "Programme 2",
            approvedBudget: 85.3,
            release: 75.0,
            spent: 68.5,
            percentRelease: 87.9,
            percentReleaseSpent: 91.3,
        },
    ],
    indicatorPerformance: [
        {
            code: "P01",
            programmeName: "Programme 1",
            numberOfIndicators: 25,
            achieved: 15,
            moderatelyAchieved: 7,
            notAchieved: 2,
            noData: 1,
            percentAchieved: 60,
            percentModerate: 28,
            percentNotAchieved: 8,
            percentNoData: 4,
        },
    ],
    outcomePerformance: [
        {
            code: "P01",
            programmeName: "Programme 1",
            outcome: "Outcome 1",
            numberOfIndicators: 12,
            achieved: 8,
            moderatelyAchieved: 3,
            notAchieved: 1,
            noData: 0,
            percentAchieved: 67,
            percentModerate: 25,
            percentNotAchieved: 8,
            percentNoData: 0,
        },
    ],
    outputPerformance: [
        {
            code: "P01",
            programmeName: "Programme 1",
            outcome: "Output 1",
            numberOfIndicators: 8,
            achieved: 5,
            moderatelyAchieved: 2,
            notAchieved: 1,
            noData: 0,
            percentAchieved: 62.5,
            percentModerate: 25,
            percentNotAchieved: 12.5,
            percentNoData: 0,
        },
    ],
    detailedOutcomes: [
        {
            outcome: "Improved Service Delivery",
            indicator: "Customer Satisfaction Index",
            baseline: "65%",
            target: "75%",
            actual: "78%",
            percentAchieved: "104%",
            explanation: "Target exceeded due to enhanced processes",
        },
    ],
    detailedIntermediateOutcomes: [
        {
            outcome: "Staff Capacity Enhanced",
            indicator: "Trained Staff (%)",
            baseline: "60%",
            target: "80%",
            actual: "85%",
            percentAchieved: "106%",
            explanation: "Training program exceeded expectations",
        },
    ],
    detailedOutputs: [
        {
            outcome: "Policy Documents",
            indicator: "Documents Produced",
            baseline: "15",
            target: "20",
            actual: "22",
            percentAchieved: "110%",
            explanation: "Exceeded target due to increased demand",
        },
    ],
    piapActions: [
        {
            action: "Infrastructure Development",
            budgetPlanned: "50.5 Bn",
            budgetApproved: "48.0 Bn",
            budgetReleased: "45.0 Bn",
            budgetSpent: "42.5 Bn",
            percentSpent: "94.4%",
            explanation: "On track with planned activities",
        },
    ],
};
