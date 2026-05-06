# The Church of Pentecost | COP YEAR

A world-class, interactive digital portal designed for **The Church of Pentecost** to streamline access to global events and comprehensive personnel data across every ministry year. This platform serves as a dynamic central hub, providing an immersive experience for both leadership and the global congregation with real-time data management.

## Vision
To provide a seamless, state-of-the-art interface that reflects the divine mission of the Church, ensuring every member and leader can stay connected with the global calendar and the structural hierarchy of our personnel, year after year.

## Key Features

### Dynamic Admin Dashboard
*   **Real-time Control:** A specialized dashboard to manage and update events, personnel, and jurisdictional data instantly.
*   **Multi-Year Support:** Built to adapt to new ministry themes and calendars as they are released annually.

### Interactive Activity Calendar
*   **Smart Scheduling:** A premium calendar grid that dynamically pulls the current year's activities from Supabase.
*   **Bento-Style Event Registry:** Quick access to daily event details and an animated "Upcoming Feed."
*   **Cinematic Storytelling:** A scroll-driven storytelling experience that takes users through the current ministry theme with typewriter animations and world-class motion design.

### Personnel & Leadership 
*   **Interactive Leadership Circle:** A dynamic, orbital UI showcasing the Executive Council Members.
*   **Smart Lightbox Profiles:** Detailed profile views for personnel, revealing their roles and affiliation.
*   **Comprehensive Jurisdictional Registry:** Built to provide detailed information at every level:
    *   **National** Personnel
    *   **Area** Personnel
    *   **District** Personnel
    *   **Local Assembly** Personnel

## Tech Stack
*   **Frontend:** Next.js 14 (App Router), React, TypeScript
*   **Styling:** TailwindCSS (Premium utility-first styling)
*   **Animations:** Framer Motion (for cinematic transitions and morphing interactions)
*   **Icons:** Lucide React
*   **Database:** **Supabase** (PostgreSQL) - Powering real-time synchronization and multi-year data persistence.

## Database Structure (Supabase)
The project is architected to leverage Supabase for a robust and scalable data layer:

*   **`events` table:** Stores global activities, dates, categories, and descriptive content linked to specific ministry years.
*   **`personnel` table:** Comprehensive registry including names, high-resolution imagery, and bio data.
*   **`jurisdictions` table:** Relational mapping of Assemblies -> Districts -> Areas -> National levels.

## Design Philosophy
*   **Human Touch:** Utilizing organic textures, soft glows, and editorial typography.
*   **Morphing UI:** A state-of-the-art navbar that adapts vertically and horizontally to the user's scroll.
*   **Sustainable Design:** Components are built to be reusable and theme-agnostic for year-over-year updates.

---

*“Possessing the Nations: I am an Agent of Transformation.”*
© The Church of Pentecost.
