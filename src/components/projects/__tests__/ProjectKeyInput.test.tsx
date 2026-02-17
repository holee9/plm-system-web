// ProjectKeyInput Component Tests
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectKeyInput } from "../ProjectKeyInput";

describe("ProjectKeyInput", () => {
  it("should render input with label", () => {
    render(<ProjectKeyInput value="TEST" onChange={vi.fn()} />);

    expect(screen.getByLabelText(/project key/i)).toBeInTheDocument();
  });

  it("should display current value", () => {
    render(<ProjectKeyInput value="PROJ01" onChange={vi.fn()} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("PROJ01");
  });

  it("should convert input to uppercase", () => {
    const handleChange = vi.fn();
    render(<ProjectKeyInput value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "proj01" } });

    expect(handleChange).toHaveBeenCalledWith("PROJ01");
  });

  it("should filter non-alphanumeric characters", () => {
    const handleChange = vi.fn();
    render(<ProjectKeyInput value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "P-R-O-J!" } });

    expect(handleChange).toHaveBeenCalledWith("PROJ");
  });

  it("should limit to 10 characters", () => {
    const handleChange = vi.fn();
    render(<ProjectKeyInput value="" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "ABCDEFGHIJKL" } });

    expect(handleChange).toHaveBeenCalledWith("ABCDEFGHIJ");
  });

  it("should show helper text with format requirements", () => {
    render(<ProjectKeyInput value="TEST" onChange={vi.fn()} />);

    expect(
      screen.getByText(/2-10 uppercase letters and numbers/i)
    ).toBeInTheDocument();
  });

  it("should show required indicator when required", () => {
    render(<ProjectKeyInput value="TEST" onChange={vi.fn()} required />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should not show required indicator when not required", () => {
    render(<ProjectKeyInput value="TEST" onChange={vi.fn()} required={false} />);

    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<ProjectKeyInput value="TEST" onChange={vi.fn()} disabled />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("should show error message when provided", () => {
    render(
      <ProjectKeyInput value="TEST" onChange={vi.fn()} error="Key already exists" />
    );

    expect(screen.getByText("Key already exists")).toBeInTheDocument();
  });

  it("should display helper text with example", () => {
    render(<ProjectKeyInput value="TEST" onChange={vi.fn()} />);

    expect(screen.getByText(/PLM, PROJ01/i)).toBeInTheDocument();
  });
});
