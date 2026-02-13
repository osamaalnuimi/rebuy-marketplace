# Architecture Documentation

## Project Structure

```
src/app/
├── features/                          # Feature modules
│   └── offers/
│       ├── pages/                     # Smart Components
│       ├── data-access/               # State & Business Logic
│       │   ├── models/
│       │   └── store/
│       └── ui/                        # Presentational Components
├── layout/                            # Layout components
├── shared/                            # Shared across features
│   ├── data-access/
│   ├── ui/
│   └── utils/
└── styles/                            # Design system
    ├── abstracts/
    └── base/
```

## Architecture Principles

### Feature-Sliced Design

- Domain-driven structure instead of generic folders
- Each feature is self-contained
- Clear boundaries between features

### Smart vs Dumb Component Pattern

**Smart Components (Pages)**

- Located in `features/*/pages/`
- Handle business logic and state
- Inject services and manage data
- Pass data to presentational components

**Dumb Components (UI)**

- Located in `features/*/ui/`
- Presentational only
- Receive data via `input()` signals
- Emit events via `output()` signals
- Reusable across different contexts

### State Management

- Signal-based reactive state using Angular Signals
- Centralized in `features/*/data-access/`
- Separates data concerns from view logic

### Design System

**Design Tokens**

- Centralized values in `_variables.scss`
- Colors, spacing, typography, transitions

**Mixins**

- Reusable style patterns in `_mixins.scss`
- Button styles, card layouts, responsive breakpoints

**Usage**

```scss
@use 'app/styles/abstracts/variables' as *;
@use 'app/styles/abstracts/mixins' as *;

.offer-card {
  @include card;
  padding: $spacing-lg;
}
```

## Technical Stack

**Angular Signals**

- Signal-based reactive state

- Built-in to Angular

**OnPush Change Detection**

- All components use `ChangeDetectionStrategy.OnPush`
- Signals trigger updates automatically
- Better performance

**Modern Control Flow**

- `@if`, `@for`, `@switch` syntax
- Better type inference
- Improved performance

**Standalone Components**

- No NgModules required
- Better tree-shaking
- Simpler dependency management

## Best Practices

**BEM-like Naming**

```scss
.offer-card {
  &__image {
  }
  &__title {
  }
  &--featured {
  }
}
```

**Mobile-First Responsive**

```scss
.header {
  flex-direction: column;

  @include tablet {
    flex-direction: row;
  }
}
```

**Design Tokens**

```scss
// Use tokens, not magic numbers
padding: $spacing-lg;
color: $color-primary;
```
