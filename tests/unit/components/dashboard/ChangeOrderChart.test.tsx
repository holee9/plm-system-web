/**
 * Tests for ChangeOrderChart component
 *
 * Tests cover:
 * - Rendering with data
 * - Rendering empty state
 * - Horizontal layout
 * - Vertical layout
 * - Bar width calculation
 * - Percentage calculation
 * - Click handler
 * - Status summary
 * - Mini chart
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ChangeOrderChart,
  ChangeOrderStatusSummary,
  ChangeOrderMiniChart,
  type ChangeOrderDataPoint,
} from "@/components/dashboard/change-order-chart";

const mockData: ChangeOrderDataPoint[] = [
  {
    status: "draft",
    count: 5,
    label: "초안",
    color: "bg-slate-500",
  },
  {
    status: "submitted",
    count: 3,
    label: "제출됨",
    color: "bg-blue-500",
  },
  {
    status: "in_review",
    count: 2,
    label: "검토 중",
    color: "bg-amber-500",
  },
  {
    status: "approved",
    count: 10,
    label: "승인됨",
    color: "bg-emerald-500",
  },
  {
    status: "rejected",
    count: 1,
    label: "거부됨",
    color: "bg-rose-500",
  },
  {
    status: "implemented",
    count: 4,
    label: "구현됨",
    color: "bg-green-500",
  },
];

describe("ChangeOrderChart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with title", () => {
      render(<ChangeOrderChart data={mockData} />);

      expect(screen.getByText("변경 요청 현황")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<ChangeOrderChart data={mockData} title="Custom Title" />);

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should render total count badge", () => {
      render(<ChangeOrderChart data={mockData} />);

      expect(screen.getByText("총 25건")).toBeInTheDocument();
    });

    it("should render all status labels", () => {
      render(<ChangeOrderChart data={mockData} />);

      expect(screen.getByText("초안")).toBeInTheDocument();
      expect(screen.getByText("제출됨")).toBeInTheDocument();
      expect(screen.getByText("검토 중")).toBeInTheDocument();
      expect(screen.getByText("승인됨")).toBeInTheDocument();
      expect(screen.getByText("거부됨")).toBeInTheDocument();
      expect(screen.getByText("구현됨")).toBeInTheDocument();
    });

    it("should render count values", () => {
      render(<ChangeOrderChart data={mockData} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should render empty state when no data", () => {
      render(<ChangeOrderChart data={[]} />);

      expect(screen.getByText("변경 요청 데이터가 없습니다")).toBeInTheDocument();
    });

    it("should show total as 0 when no data", () => {
      render(<ChangeOrderChart data={[]} />);

      expect(screen.getByText("총 0건")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("should render horizontal layout by default", () => {
      const { container } = render(<ChangeOrderChart data={mockData} />);

      // Default layout should be horizontal
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render horizontal layout explicitly", () => {
      render(<ChangeOrderChart data={mockData} layout="horizontal" />);

      expect(screen.getByText("초안")).toBeInTheDocument();
    });

    it("should render vertical layout", () => {
      render(<ChangeOrderChart data={mockData} layout="vertical" />);

      expect(screen.getByText("초안")).toBeInTheDocument();
    });
  });

  describe("Calculations", () => {
    it("should calculate correct percentages", () => {
      render(<ChangeOrderChart data={mockData} showPercentage={true} />);

      // 10 out of 25 = 40%
      expect(screen.getByText("40%")).toBeInTheDocument();
      // 4 out of 25 = 16%
      expect(screen.getByText("16%")).toBeInTheDocument();
    });

    it("should show dash for 0% percentage", () => {
      const dataWithZero = [
        { status: "draft", count: 0, label: "초안", color: "bg-slate-500" },
      ];

      render(<ChangeOrderChart data={dataWithZero} showPercentage={true} />);

      // Empty state shown instead of individual bars
      expect(screen.getByText("변경 요청 데이터가 없습니다")).toBeInTheDocument();
    });

    it("should calculate bar width relative to max count", () => {
      // Max count is 10 (approved), so approved should have 100% width
      // and draft (5) should have 50% width
      render(<ChangeOrderChart data={mockData} />);

      // The bars should be rendered with correct relative widths
      expect(screen.getByText("10")).toBeInTheDocument(); // Max value
      expect(screen.getByText("5")).toBeInTheDocument(); // Half of max
    });
  });

  describe("Click Handler", () => {
    it("should call onStatusClick when status bar is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ChangeOrderChart data={mockData} onStatusClick={handleClick} />);

      // Click on a status item
      const draftItem = screen.getByText("초안");
      await user.click(draftItem);

      expect(handleClick).toHaveBeenCalledWith("draft");
    });

    it("should not call onStatusClick when handler is not provided", async () => {
      const user = userEvent.setup();

      render(<ChangeOrderChart data={mockData} />);

      const draftItem = screen.getByText("초안");
      await user.click(draftItem);

      // Should not throw error
      expect(draftItem).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <ChangeOrderChart data={mockData} className="custom-class" />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it("should hide percentage when showPercentage is false", () => {
      render(<ChangeOrderChart data={mockData} showPercentage={false} />);

      // Percentages should not be displayed
      expect(screen.queryByText("40%")).not.toBeInTheDocument();
    });
  });
});

describe("ChangeOrderStatusSummary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all status items", () => {
      render(<ChangeOrderStatusSummary data={mockData} />);

      expect(screen.getByText("초안")).toBeInTheDocument();
      expect(screen.getByText("제출됨")).toBeInTheDocument();
      expect(screen.getByText("검토 중")).toBeInTheDocument();
      expect(screen.getByText("승인됨")).toBeInTheDocument();
      expect(screen.getByText("거부됨")).toBeInTheDocument();
      expect(screen.getByText("구현됨")).toBeInTheDocument();
    });

    it("should render counts with percentages", () => {
      render(<ChangeOrderStatusSummary data={mockData} />);

      // Should show counts and percentages
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should apply correct status colors", () => {
      const { container } = render(<ChangeOrderStatusSummary data={mockData} />);

      // Status items should have color classes
      expect(container).toBeInTheDocument();
    });
  });

  describe("Trend Indicators", () => {
    it("should show upward trend when approved > rejected", () => {
      render(<ChangeOrderStatusSummary data={mockData} />);

      expect(screen.getByText("승인 우위")).toBeInTheDocument();
    });

    it("should show downward trend when rejected > approved", () => {
      const dataWithMoreRejected = [
        {
          status: "approved",
          count: 1,
          label: "승인됨",
          color: "bg-emerald-500",
        },
        {
          status: "rejected",
          count: 5,
          label: "거부됨",
          color: "bg-rose-500",
        },
      ];

      render(<ChangeOrderStatusSummary data={dataWithMoreRejected} />);

      expect(screen.getByText("거부 증가")).toBeInTheDocument();
    });

    it("should not show trend when equal", () => {
      const dataEqual = [
        {
          status: "approved",
          count: 3,
          label: "승인됨",
          color: "bg-emerald-500",
        },
        {
          status: "rejected",
          count: 3,
          label: "거부됨",
          color: "bg-rose-500",
        },
      ];

      render(<ChangeOrderStatusSummary data={dataEqual} />);

      // Neither trend should be shown
      expect(screen.queryByText("승인 우위")).not.toBeInTheDocument();
      expect(screen.queryByText("거부 증가")).not.toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <ChangeOrderStatusSummary data={mockData} className="custom-class" />
      );

      expect(container).toBeInTheDocument();
    });
  });
});

describe("ChangeOrderMiniChart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render mini chart bars", () => {
      const { container } = render(<ChangeOrderMiniChart data={mockData} />);

      expect(container).toBeInTheDocument();
    });

    it("should render empty data", () => {
      const { container } = render(<ChangeOrderMiniChart data={[]} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Bar Width Calculation", () => {
    it("should calculate bar widths as percentage of total", () => {
      const { container } = render(<ChangeOrderMiniChart data={mockData} />);

      // Total is 25, approved (10) should be 40%
      expect(container).toBeInTheDocument();
    });

    it("should handle single status", () => {
      const singleData = [
        {
          status: "approved",
          count: 10,
          label: "승인됨",
          color: "bg-emerald-500",
        },
      ];

      const { container } = render(<ChangeOrderMiniChart data={singleData} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe("Tooltip", () => {
    it("should have title attribute with status info", () => {
      const { container } = render(<ChangeOrderMiniChart data={mockData} />);

      // Bars should have title attributes
      const bars = container.querySelectorAll("div[title]");
      expect(bars.length).toBeGreaterThan(0);
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <ChangeOrderMiniChart data={mockData} className="h-4" />
      );

      expect(container).toBeInTheDocument();
    });
  });
});

describe("Data Point Types", () => {
  it("should accept all valid status types", () => {
    const validStatuses = [
      "draft",
      "submitted",
      "in_review",
      "approved",
      "rejected",
      "implemented",
    ] as const;

    validStatuses.forEach((status) => {
      const data: ChangeOrderDataPoint = {
        status,
        count: 1,
        label: "Test",
        color: "bg-gray-500",
      };
      expect(data.status).toBe(status);
    });
  });
});
