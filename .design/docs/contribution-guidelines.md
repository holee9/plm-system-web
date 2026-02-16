# Design Token Contribution Guidelines

This document provides guidelines for contributing to the PLM design system tokens.

## Table of Contents

- [Getting Started](#getting-started)
- [Token File Structure](#token-file-structure)
- [Adding New Tokens](#adding-new-tokens)
- [Token Generation](#token-generation)
- [Testing](#testing)
- [Documentation](#documentation)
- [Code Review](#code-review)

## Getting Started

### Prerequisites

- Node.js installed
- Familiarity with JSON schema
- Understanding of CSS custom properties
- Knowledge of TypeScript types

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Navigate to the design system directory: `cd .design`

## Token File Structure

### Directory Organization

```
.design/
├── tokens/              # Token JSON files
│   ├── colors.json
│   ├── spacing.json
│   ├── typography.json
│   ├── border-radius.json
│   ├── shadows.json
│   ├── animation.json
│   ├── breakpoints.json
│   └── z-index.json
├── schemas/            # JSON schemas
│   └── token-schema.json
├── docs/               # Documentation
│   ├── usage-guide.md
│   ├── naming-convention.md
│   └── contribution-guidelines.md
└── components/         # Component specifications
```

### Token File Format

Each token file follows this structure:

```json
{
  "$schema": "../schemas/token-schema.json",
  "name": "plm-{category}-tokens",
  "version": "1.0.0",
  "description": "Human-readable description",
  "{category}": {
    "tokenName": "token value",
    "anotherToken": "another value"
  }
}
```

### Required Fields

- `$schema`: Reference to JSON schema for validation
- `name`: Unique identifier for the token set
- `version`: Semantic version number
- `description`: Human-readable description
- `{category}`: Category-specific token definitions

## Adding New Tokens

### Step 1: Plan the Token

Before adding a new token, consider:

- **Purpose**: What problem does this token solve?
- **Usage**: Where will this token be used?
- **Scope**: Is this a global or component-specific token?
- **Naming**: Does it follow the naming convention?

### Step 2: Choose the Category

Select the appropriate token category:

- **spacing**: Margins, paddings, gaps
- **colors**: All color values
- **typography**: Fonts, sizes, weights
- **borderRadius**: Corner rounding
- **shadows**: Box shadows
- **animation**: Durations, easing functions
- **zIndex**: Layering
- **breakpoints**: Responsive breakpoints

### Step 3: Add Token to JSON File

Open the appropriate JSON file in `.design/tokens/` and add your token:

```json
{
  "spacing": {
    "4xl": "5rem"
  }
}
```

### Step 4: Validate the Token

Ensure your token follows the JSON schema:

```bash
# Validate against schema (if validation tool is available)
npm run validate-tokens
```

### Step 5: Generate Artifacts

Run the generation scripts to create CSS and TypeScript files:

```bash
# Generate CSS custom properties
npm run design-tokens:generate

# Generate TypeScript types
npm run design-tokens:types
```

### Step 6: Test the Token

Write tests for the new token in `tests/unit/design/`:

```typescript
it("should include new spacing token", () => {
  const cssTokens = readFileSync(cssTokensPath, "utf-8");
  expect(cssTokens).toMatch(/--spacing-4xl:/);
});
```

Run tests:

```bash
npm test -- tests/unit/design/
```

### Step 7: Update Documentation

Update the relevant documentation:

- **usage-guide.md**: Add usage examples
- **naming-convention.md**: Document naming pattern (if new category)

### Step 8: Create Pull Request

Submit a PR with:

- Clear description of the token addition
- Usage examples
- Test results
- Documentation updates

## Token Generation

### CSS Generation

The CSS generator (`scripts/generate-css-tokens.ts`) creates:

1. **Root variables**: Theme-independent tokens (spacing, typography, etc.)
2. **Theme classes**: Light and dark theme color tokens
3. **CSS custom properties**: Using `--token-name` format

### TypeScript Generation

The TypeScript generator (`scripts/generate-ts-types.ts`) creates:

1. **Type definitions**: Union types for token values
2. **Constants**: Type-safe constant exports
3. **Interfaces**: Token category interfaces
4. **Token object**: Centralized token export

### Regenerating Tokens

After modifying token JSON files, always regenerate:

```bash
# Generate both CSS and TypeScript
npm run design-tokens:generate && npm run design-tokens:types
```

## Testing

### Unit Tests

All tokens must have corresponding unit tests:

```typescript
describe("Token Category", () => {
  it("should have token in CSS", () => {
    const css = readFileSync(cssTokensPath, "utf-8");
    expect(css).toMatch(/--token-name:/);
  });

  it("should have token in TypeScript", () => {
    const types = readFileSync(typesFilePath, "utf-8");
    expect(types).toMatch(/TOKEN_NAME/);
  });
});
```

### Integration Tests

Test tokens in actual components:

```typescript
it("should apply spacing token correctly", () => {
  const { container } = render(<Component spacing="md" />);
  expect(container.firstChild).toHaveStyle({ padding: "1rem" });
});
```

### Visual Tests

Verify tokens visually in both themes:

- Light theme: Check color contrast and readability
- Dark theme: Check color contrast and readability
- Responsive: Test at different breakpoints

## Documentation

### Required Documentation

Every token addition must include:

1. **Usage guide example**: How to use the token
2. **Naming convention entry**: If adding a new pattern
3. **TypeScript comment**: If manually adding types

### Documentation Format

```markdown
### Token Category

**Description**: What this token category is for

**Usage**: How to use these tokens

\`\`\`typescript
import { TOKEN_NAME } from "@/design/tokens.types";
\`\`\`

**Examples**: Common use cases
```

## Code Review

### Review Checklist

When reviewing token changes, check:

- [ ] Follows naming convention
- [ ] Valid JSON schema
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Both themes tested (for colors)
- [ ] No breaking changes (or properly documented)
- [ ] Generated files included

### Approval Process

1. **Automated checks**: CI validates JSON and runs tests
2. **Peer review**: Design system maintainer reviews
3. **Integration testing**: Test in actual components
4. **Approval**: Merge when all checks pass

## Best Practices

### DO

- Add tokens for reusable values
- Follow existing naming patterns
- Write tests for new tokens
- Document usage examples
- Test in both themes
- Use semantic naming

### DON'T

- Add one-off tokens (use inline styles instead)
- Break existing naming conventions
- Forget to regenerate artifacts
- Skip documentation
- Ignore test failures
- Use hardcoded values

## Version Management

### Semantic Versioning

- **MAJOR**: Breaking changes to token names or structure
- **MINOR**: New tokens added, backward compatible
- **PATCH**: Bug fixes, documentation updates

### Deprecation Process

When deprecating tokens:

1. Mark as deprecated in JSON (add `deprecated` field)
2. Keep in generated files for backward compatibility
3. Add migration guide to documentation
4. Remove in next major version

## Troubleshooting

### Common Issues

**Issue**: Token not appearing in CSS
- **Solution**: Run `npm run design-tokens:generate`

**Issue**: TypeScript errors after adding token
- **Solution**: Run `npm run design-tokens:types`

**Issue**: Tests failing after token changes
- **Solution**: Update test expectations to match new tokens

**Issue**: Theme not switching
- **Solution**: Verify CSS class names match `.light` and `.dark`

### Getting Help

- Check existing tokens for patterns
- Review naming convention documentation
- Ask in team chat/Slack
- Create issue with detailed description

## Resources

- [Usage Guide](./usage-guide.md)
- [Naming Convention](./naming-convention.md)
- [Token Schema](../schemas/token-schema.json)
- [Design Tokens W3C](https://www.w3.org/community/design-tokens/)
