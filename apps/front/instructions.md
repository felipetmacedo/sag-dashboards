# INSTRUCTIONS.md

Project: Apollo Platform  
Modules: 
- apollo-ui-v2 (Frontend - React)
- apollo-api (Backend - Node.js/Express)

---

## 📁 apollo-ui-v2 (Frontend)

### Stack:
- React + TypeScript
- Vite
- shadcn/ui (UI components)
- Zod (Validation)
- Tailwind CSS
- Zustand (if state management is used)
- React Router DOM

---

### Folder Structure:

src/
├── app/                     - App entry, routing, providers
├── assets/                  - Static files (e.g. images)
├── components/              - Reusable components
│   ├── prancing-card/
│   ├── sidebar/
│   └── team/
│       └── TeamForm.tsx
├── features/                - Feature-based directory
│   ├── About/
│   ├── Dashboard/
│   ├── Home/
│   ├── Login/
│   ├── Plans/
│   ├── Profile/
│   ├── RequestPasswordReset/
│   ├── ResetPassword/
│   ├── Signup/
│   └── Teams/
│       ├── index.ts
│       ├── Teams.container.ts
│       └── Teams.tsx
├── guards/                  - Auth guards
├── hooks/                   - Custom React hooks
├── layouts/                 - Layout templates
├── lib/                     - Utilities or external integrations
├── processes/               - Application flows or use cases
├── routes/                  - Routing config
├── schemas/                 - Zod schemas
├── stores/                  - Zustand stores or global state
├── theme/                   - Tailwind/theme configs
└── ui/                      - UI atomic components

---

### Dev Guidelines:

- All components must use `shadcn/ui` only.
- Use reatc query and invalidate when creating new data.
- Every handler or utility function must be wrapped in `useCallback`.
- Derived or computed values must use `useMemo`.
- Avoid inline functions in JSX.
- Keep view logic in `Component.tsx` and state logic in `Component.container.ts`.
- Format on save must be enabled.
- Keep `index.ts` files for cleaner imports.

---

### Commands:

npm install  
npm run dev  
npm run build  
npm run lint  
npm run format  

---

## 📁 apollo-api (Backend)

### Stack:
- Node.js
- Express
- Sequelize ORM
- PostgreSQL
- JWT Auth
- Middleware-driven architecture

---

### Folder Structure:

src/
├── abilities/               - Permissions and access control
├── config/                  - DB and environment configurations
├── constants/               - Project-wide constants
├── controllers/             - Request controllers
│   ├── auth.js
│   ├── base.js
│   ├── index.js
│   ├── request.js
│   ├── subscribe.js
│   ├── subscription.js
│   ├── team.js
│   └── user.js
├── middlewares/            - Authentication, abilities, etc.
│   ├── abilities.js
│   ├── admin.js
│   ├── auth.js
│   ├── handle-user.js
│   ├── index.js
│   └── subscription.js
├── models/                  - Sequelize models
├── routes/                  - Express routers
├── schemas/                 - Validation schemas
├── services/                - Business logic layer
│   ├── auth.js
│   ├── email.js
│   ├── index.js
│   ├── request.js
│   ├── subscribe.js
│   ├── subscription.js
│   ├── team.js
│   └── user-permission.js
│   └── user.js
├── utils/                   - Helper utilities
└── app.js                   - Express app entry point

---

### Dev Guidelines:

- Controllers handle HTTP, must not contain business logic.
- Services handle business logic and should be reused.
- All middlewares must be reusable and context-agnostic.
- Keep validation and sanitization separate using schemas.
- Respect separation of concerns: controller → service → model.
- Use async/await and centralized error handling.
- Avoid logic in routes; delegate to controller functions.

---

### Commands:

npm install  
npm run dev (or use nodemon)  
npm run lint  
npm run migrate  
npm run seed  

---

### Suggested Middleware Stack:

- `auth.js`: Checks authentication token
- `admin.js`: Admin-only route guard
- `abilities.js`: Checks user permissions
- `handle-user.js`: Parses and attaches user info to request

---

Both front and back follow a clean modular architecture and must stay decoupled. Follow single responsibility and clean code principles across both projects.

