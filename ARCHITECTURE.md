# Rebuy Marketplace - Architecture Documentation

## 🏛️ Project Architecture

This project demonstrates **enterprise-grade Angular architecture** following industry best practices.

## 📁 Folder Structure

```
src/app/
├── features/                          # Feature modules (domain-driven)
│   └── offers/
│       ├── pages/                     # Smart Components (Container)
│       │   ├── offer-list-page/       # Main marketplace page
│       │   └── offer-details-page/    # Product details page
│       ├── data-access/               # State & Business Logic
│       │   ├── models/                # TypeScript interfaces
│       │   │   └── offer.model.ts
│       │   └── store/                 # State management
│       │       └── offers.store.ts
│       └── ui/                        # Presentational Components (Dumb)
│           ├── offer-card/            # Reusable offer card
│           ├── voting-controls/       # Voting UI component
│           └── purchase-modal/        # Purchase confirmation
├── layout/                            # Layout components
│   ├── header/
│   └── footer/
├── shared/                            # Shared across features
│   ├── data-access/
│   │   └── mocks/                     # Mock data
│   ├── ui/                            # Shared components
│   └── utils/                         # Utilities & helpers
└── styles/                            # Design system
    ├── abstracts/
    │   ├── _variables.scss            # Design tokens
    │   ├── _mixins.scss               # SCSS mixins
    │   └── _functions.scss
    └── base/
        └── _reset.scss                # CSS reset
```

## 🎯 Architecture Principles

### 1. Feature-Sliced Design

- **Domain-driven structure** instead of generic "components/services"
- Each feature is **self-contained** and **independently deployable**
- Clear boundaries between features

### 2. Smart vs Dumb Component Pattern

#### Smart Components (Pages)

- Located in `features/*/pages/`
- **Container components** that handle business logic
- Inject services and manage state
- Pass data to dumb components via `@Input()`
- Handle events from dumb components via `@Output()`

**Example:**

```typescript
// offer-list-page.component.ts (Smart)
export class OfferListPageComponent {
  private readonly store = inject(OffersStore);
  offers = this.store.offers; // Business logic

  onUpvote(offerId: string): void {
    this.store.upvote(offerId); // Handles events
  }
}
```

#### Dumb Components (UI)

- Located in `features/*/ui/`
- **Presentational only** - no business logic
- Receive data via `input()` signals
- Emit events via `output()` signals
- **100% reusable** across different contexts

**Example:**

```typescript
// voting-controls.component.ts (Dumb)
export class VotingControlsComponent {
  votes = input.required<number>(); // Only inputs
  userVote = input<number>(0);

  upvote = output<void>(); // Only outputs
  downvote = output<void>();
}
```

### 3. Data Access Layer

- **Centralized state management** in `features/*/data-access/`
- **Signal-based reactive state** using Angular Signals
- Separates data concerns from view logic
- Easy to replace with NgRx or other state management

**Example:**

```typescript
//offers.store.ts
@Injectable({ providedIn: 'root' })
export class OffersStore {
  private readonly offersSignal = signal<Offer[]>([]);

  readonly offers = computed(() => [...this.offersSignal()].sort((a, b) => b.votes - a.votes));

  upvote(id: string): void {
    /* mutation logic */
  }
}
```

### 4. Design System with SCSS Architecture

#### Design Tokens (`_variables.scss`)

Centralized design values replace magic numbers:

```scss
$color-primary: #059669;
$spacing-lg: 1rem;
$radius-md: 8px;
$transition-fast: 0.2s ease;
```

#### Mixins (`_mixins.scss`)

Reusable style patterns:

```scss
@mixin button-primary {
  @include button-base;
  background: $color-primary;
  color: white;
  &:hover {
    background: $color-primary-dark;
  }
}

@mixin card {
  background: $color-bg-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast;
}
```

#### Usage in Components

```scss
@use 'app/styles/abstracts/variables' as *;
@use 'app/styles/abstracts/mixins' as *;

.offer-card {
  @include card; // Apply card mixin

  &__title {
    font-size: $font-size-xl; // Use design token
    color: $color-text-primary;
  }
}
```

**Benefits:**

- ✅ **Consistency** across the app
- ✅ **DRY** - no duplicate styles
- ✅ **Maintainable** - change once, applies everywhere
- ✅ **Themeable** - easy to create dark mode

## 🔧 Technical Decisions

### 1. Signals over RxJS

```typescript
// ❌ Old way (RxJS)
private offers$ = new BehaviorSubject<Offer[]>([]);
readonly offers = this.offers$.asObservable();

// ✅ New way (Signals)
private offersSignal = signal<Offer[]>([]);
readonly offers = computed(() => this.offersSignal().sort(...));
```

**Why?**

- Simpler mental model
- Better performance (fine-grained reactivity)
- Built-in to Angular (no external dependency)
- Works seamlessly with OnPush strategy

### 2. OnPush Change Detection

All components use `ChangeDetectionStrategy.OnPush`:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**Why?**

- **Massive performance improvement**
- Signals trigger updates automatically
- Prevents unnecessary re-renders

### 3. New Control Flow Syntax

```typescript
// ❌ Old way
*ngFor="let offer of offers"
*ngIf="showModal"

// ✅ New way
@for (offer of offers(); track offer.id) {}
@if (showModal()) {}
```

**Why?**

- Better type inference
- Improved performance
- More intuitive syntax

### 4. Standalone Components

No `NgModule` - everything is standalone:

```typescript
@Component({

  imports: [CommonModule, RouterLink, OfferCardComponent]
})
```

**Why?**

- Simpler dependency management
- Better tree-shaking (smaller bundles)
- Faster compilation

### 5. Input/Output Signals

```typescript
// Modern signal-based inputs/outputs
offer = input.required<Offer>();
upvoteClicked = output<void>();
```

**Why?**

- Type-safe by default
- Better developer experience
- Consistent with signal architecture

## 🎨 SCSS Best Practices

### 1. BEM-like Naming

```scss
.offer-card {                  // Block
  &__image {                   // Element
    ...
  }
  &__condition-badge {         // Element
    &--new {                   // Modifier
      ...
    }
  }
}
```

### 2. Mobile-First Responsive

```scss
.header {
  // Base styles (mobile)
  flex-direction: column;

  @include tablet {
    // Tablet overrides
  }

  @include desktop {
    // Desktop overrides
    flex-direction: row;
  }
}
```

### 3. Design Token Usage

Never use magic numbers:

```scss
// ❌ Bad
padding: 16px;
color: #059669;

// ✅ Good
padding: $spacing-lg;
color: $color-primary;
```

## 📦 State Management Strategy

### Current: Signal-based Store

- Lightweight
- Built into Angular
- Perfect for MVP

### Future: Easy Migration Path

The data-access layer design allows easy migration to:

- **NgRx** for complex apps
- **Akita** for simpler state
- **Backend API** integration

```typescript
// Easy to swap implementation
export class OffersStore {
  // Current: Mock data
  private loadOffers() {
    return MOCK_OFFERS;
  }

  // Future: API call
  private loadOffers() {
    return this.http.get<Offer[]>('/api/offers');
  }
}
```

## 🚀 Scalability

### Adding New Features

1. Create feature folder: `features/new-feature/`
2. Add pages, data-access, and ui subdirectories
3. Implement using same patterns
4. **No changes to existing features needed**

### Adding New Components

1. Determine if smart (page) or dumb (ui)
2. Place in appropriate folder
3. Follow input/output pattern
4. Reuse design tokens and mixins

### Adding New Routes

```typescript
// app.routes.ts
{
  path: 'new-feature',
  loadComponent: () =>
    import('./features/new-feature/pages/...')
}
```

## 📊 Benefits of This Architecture

### For Development

- ✅ **Clear separation of concerns**
- ✅ **Easy to test** (dumb components are pure functions)
- ✅ **Reusable components** (ui folder)
- ✅ **Predictable** structure

### For Maintenance

- ✅ **Easy to locate** code (domain-driven folders)
- ✅ **Safe refactoring** (isolated features)
- ✅ **Consistent** patterns throughout

### For Scaling

- ✅ **Team can work** on different features independently
- ✅ **Easy to add** new features without conflicts
- ✅ **Code splitting** by feature (lazy loading)

## 🎓 Learning Resources

This architecture follows:

- [Angular Style Guide](https://angular.dev/style-guide)
- [Feature-Sliced Design](https://feature-sliced.design/)
- Smart/Dumb Component Pattern
- BEM Methodology (for CSS)
- Design Tokens System

## 🔄 Migration Path from Old Structure

```
OLD (Generic)              →  NEW (Feature-based)
components/                →  features/offers/pages/
services/                  →  features/offers/data-access/store/
models/                    →  features/offers/data-access/models/
[no separation]            →  features/offers/ui/ (dumb components)
styles.scss (monolithic)   →  styles/abstracts/ (design system)
```

---

**This architecture demonstrates senior-level Angular expertise and production-ready code organization.**
