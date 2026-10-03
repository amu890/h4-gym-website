# H4 Gym Website

Welcome to the **H4 Gym Website** project. This is a premium, high-performance static website designed to showcase a modern fitness center. It emphasizes a sleek aesthetic, fast load times, and dynamic user interactions to deliver a compelling digital experience for gym members and prospective clients.

## 🚀 Project Description
The H4 Gym website serves as the primary digital storefront for a top-tier athletic facility. It provides comprehensive details on membership plans, certified trainers, specialized workout programs, and real member transformations. The site is built with a focus on high performance, accessibility, and robust responsive design, ensuring it looks incredible on any device.

## 🛠️ Main Technologies
This project was built from the ground up as a pure static frontend to maximize speed and deployment flexibility. It uses no heavy frameworks or external libraries, relying entirely on native web standards:
- **HTML5**: Semantic and accessible markup.
- **CSS3 (Vanilla)**: Advanced layouts using CSS Grid and Flexbox, utilizing a scalable CSS variable (Custom Properties) token system.
- **JavaScript (ES6+)**: Lightweight, native scripting for interactive components without the overhead of frameworks like React or jQuery.

## ✨ Main Features
- **Multi-Page Architecture**: Includes dedicated pages for Services, Facility/Gallery, Trainers, Reviews, Memberships, and Contact forms.
- **Dark/Light Mode**: A pure CSS theme toggle system that flawlessly switches between an Athletic Midnight theme and a clean High-Contrast Gold theme.
- **Interactive Lightbox Gallery**: A fully custom, JavaScript-powered image gallery with keyboard navigation (next/prev) for exploring the facility.
- **Responsive FAQ Accordion**: A smooth, accessible accordion component built with precise max-height transitions for frequently asked questions.
- **Form Validation**: Comprehensive client-side form validation (Regex-powered) on the Contact and Newsletter forms to ensure accurate data entry.

## 📱 Responsive Design
The website was engineered with a **Mobile-First approach** utilizing fluid typography (`clamp()`) and fluid spacing. Features include:
- A pure CSS mobile hamburger navigation menu (no JS required for the toggle), ensuring the menu is highly performant and fail-safe on mobile devices.
- Touch-friendly tap targets strictly adhering to a minimum 44x44px accessible size.
- Grid layouts that adapt seamlessly from 320px mobile screens up to ultra-wide desktop monitors without horizontal overflow.

## 🎬 Animations & Interactions
- **Scroll-Reveal (Intersection Observer)**: Elements elegantly fade and slide up into view as the user scrolls down the page, handled performantly via the native IntersectionObserver API.
- **Hover Micro-interactions**: Buttons feature smooth drop-shadow elevations, while trainer and gallery cards softly scale up on hover.
- **Accessibility Mindful**: Fully respects user system preferences. The site includes a global `@media (prefers-reduced-motion: reduce)` directive that disables all decorative transitions and animations for users with motion sensitivities.

## 💻 How to Run Locally
Because this is a pure static frontend, you do not need Node.js, databases, or complex build tools to run it. 

**Option 1: Using VS Code Live Server (Recommended)**
1. Open the project folder in Visual Studio Code.
2. Install the "Live Server" extension by Ritwick Dey.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The website will automatically open in your default browser at `http://127.0.0.1:5500`.

**Option 2: Using Python**
If you have Python installed, you can quickly spin up a local server:
1. Open your terminal or command prompt.
2. Navigate to the project root directory.
3. Run the following command:
   ```bash
   python -m http.server 8000
   ```
4. Open your web browser and navigate to `http://localhost:8000/index.html`.

**Option 3: Direct File Open**
You can simply double-click `index.html` in your file explorer to open it directly in your browser using the `file:///` protocol. Note that some advanced features (like strict CORS or certain local fetching) may behave slightly differently than on a true web server.
