# Book Worm - React Responsive Layout

A responsive React application that replicates the Book Worm e-commerce website design with a dark theme.

## Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Dark Theme**: Modern dark color scheme matching the original design
- **Component-Based Architecture**: Modular React components for easy maintenance
- **Interactive UI**: Hover effects, clickable elements, and smooth transitions
- **Book Catalog**: Three sections - Recommended for You, Bestsellers this Month, and New Launches
- **Search & Filters**: Search bar with multiple filter options (Language, Format, Price Range, Sort)
- **Sidebar Navigation**: Genre categories with active state
- **Header Navigation**: Logo, navigation links, shopping cart with badge, and user icon

## Project Structure

```
Front-end/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Header.css
│   │   ├── Sidebar.js
│   │   ├── Sidebar.css
│   │   ├── BookCard.js
│   │   ├── BookCard.css
│   │   ├── MainContent.js
│   │   └── MainContent.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Components

### Header
- Fixed navigation bar with logo, menu links, cart icon with badge, and user icon
- Responsive hamburger menu for mobile devices

### Sidebar
- Genre categories list
- Sticky positioning on desktop
- Slide-in drawer on mobile (toggled by hamburger menu)

### BookCard
- Displays book cover with custom colors and icons
- Book information including title, author, description, format, genres, price, and delivery date
- Hover effects for better interactivity

### MainContent
- Search bar with filters
- Three book sections with grid layouts
- Responsive grid that adapts to different screen sizes

## Responsive Breakpoints

- **Desktop**: > 768px - Full layout with sidebar
- **Tablet**: 768px - Adjusted grid and spacing
- **Mobile**: < 768px - Stacked layout, hidden sidebar (accessible via menu)

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Technologies Used

- React 18.2.0
- CSS3 with Flexbox and Grid
- React Scripts 5.0.1

## Design Features

- Dark background (#1a1a1a, #0d0d0d)
- Accent colors for interactive elements
- Smooth transitions and hover effects
- Custom scrollbar styling
- Mobile-first responsive design
- Grid-based book layout

## Browser Compatibility

Works on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge