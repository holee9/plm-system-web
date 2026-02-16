/**
 * Tests for LoadingSpinner component
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render with default message", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("로그인 확인 중...")).toBeInTheDocument();
  });

  it("should render with custom message", () => {
    render(<LoadingSpinner message="로딩 중..." />);
    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("should have correct aria attributes for accessibility", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute("aria-live", "polite");
  });
});
